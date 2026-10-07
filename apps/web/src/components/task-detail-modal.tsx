'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, Subtask, TaskComment, User } from '@wms/shared';
import { StatusBadge, PriorityBadge } from './badge.js';
import { apiClient } from '../lib/api.js';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  MessageSquare,
  ListTodo,
  Send,
  Building2,
  Calendar,
  UserCheck,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  currentUser?: User | null;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  currentUser,
  onClose,
  onStatusChange,
  onDelete,
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'subtasks' | 'comments'>('overview');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (!task || !isOpen) return;

    const fetchSubtasksAndComments = async () => {
      try {
        setLoadingItems(true);
        const [subRes, comRes] = await Promise.all([
          apiClient.getSubtasks(task.id),
          apiClient.getComments(task.id),
        ]);
        setSubtasks(subRes.subtasks);
        setComments(comRes.comments);
      } catch (err: any) {
        console.warn('Live subtasks/comments fetch failed, using local store:', err.message);
        // Fallback demo items if offline
        setSubtasks([
          {
            id: 'sub-local-1',
            taskId: task.id,
            title: 'Verify student prerequisites and test scores',
            isCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'sub-local-2',
            taskId: task.id,
            title: 'Prepare class syllabus and instructional materials',
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setComments([
          {
            id: 'com-local-1',
            taskId: task.id,
            authorId: 'usr-admin-01',
            content: 'Please ensure high-priority placement roster is finalized before end of week.',
            author: { fullName: 'David Miller', role: 'FACILITY_MANAGER' as any },
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchSubtasksAndComments();
  }, [task, isOpen]);

  // Subtask progress calculation
  const completedCount = useMemo(
    () => subtasks.filter((s) => s.isCompleted).length,
    [subtasks],
  );
  const progressPercent = useMemo(
    () => (subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0),
    [subtasks, completedCount],
  );

  const handleToggleSubtask = async (subtaskId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtaskId
          ? { ...s, isCompleted: newVal, completedAt: newVal ? new Date().toISOString() : null }
          : s,
      ),
    );

    if (task) {
      try {
        await apiClient.toggleSubtask(task.id, subtaskId, newVal);
      } catch (err: any) {
        console.warn('Backend subtask update failed:', err.message);
      }
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;

    const tempId = `sub-tmp-${Date.now()}`;
    const newSub: Subtask = {
      id: tempId,
      taskId: task.id,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
      assigneeUserId: currentUser?.id,
      assigneeUser: { fullName: currentUser?.fullName },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSubtasks((prev) => [...prev, newSub]);
    setNewSubtaskTitle('');

    try {
      const created = await apiClient.createSubtask(task.id, {
        title: newSub.title,
        assigneeUserId: currentUser?.id,
      });
      setSubtasks((prev) => prev.map((s) => (s.id === tempId ? created : s)));
    } catch (err: any) {
      console.warn('Backend subtask creation failed:', err.message);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
    if (task) {
      try {
        await apiClient.deleteSubtask(task.id, subtaskId);
      } catch (err: any) {
        console.warn('Backend subtask delete failed:', err.message);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !task) return;

    const tempComment: TaskComment = {
      id: `com-tmp-${Date.now()}`,
      taskId: task.id,
      authorId: currentUser?.id || 'usr-local',
      content: newCommentText.trim(),
      author: {
        id: currentUser?.id,
        fullName: currentUser?.fullName || 'Current User',
        email: currentUser?.email,
        role: currentUser?.role,
      },
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, tempComment]);
    setNewCommentText('');

    try {
      const created = await apiClient.addComment(task.id, tempComment.content);
      setComments((prev) => prev.map((c) => (c.id === tempComment.id ? created : c)));
    } catch (err: any) {
      console.warn('Backend comment post failed:', err.message);
    }
  };

  if (!isOpen || !task) return null;

  const statuses = [
    TaskStatus.NEW,
    TaskStatus.ASSIGNED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.BLOCKED,
    TaskStatus.PENDING_REVIEW,
    TaskStatus.COMPLETED,
    TaskStatus.CANCELLED,
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-modal shadow-modal max-w-xl w-full p-6 border border-border-default space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 pb-3 border-b border-border-subtle shrink-0">
          <div className="space-y-1.5 min-w-0 flex-1">
            <h2 className="text-base font-bold text-text-primary leading-snug truncate">
              {task.title}
            </h2>
            <div className="flex items-center space-x-2 pt-0.5">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {subtasks.length > 0 && (
                <span className="text-[11px] font-semibold text-text-secondary bg-canvas px-2 py-0.5 rounded border border-border-default">
                  {completedCount}/{subtasks.length} subtasks
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary font-medium text-sm p-1.5 rounded-control hover:bg-canvas transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs (Overview, Subtasks, Activity/Comments) */}
        <div className="flex items-center space-x-1 border-b border-border-default shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-aqua-primary text-aqua-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subtasks')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'subtasks'
                ? 'border-aqua-primary text-aqua-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Subtasks</span>
            <span className="bg-canvas text-text-secondary text-[10px] px-1.5 py-0.2 rounded-full border border-border-default">
              {subtasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-2 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'comments'
                ? 'border-aqua-primary text-aqua-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Activity & Notes</span>
            <span className="bg-canvas text-text-secondary text-[10px] px-1.5 py-0.2 rounded-full border border-border-default">
              {comments.length}
            </span>
          </button>
        </div>

        {/* Tab Content Canvas */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'overview' && (
            <>
              {/* Description */}
              <div className="bg-canvas rounded-card p-3.5 border border-border-default">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Description
                </div>
                <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {/* Progress Bar preview if subtasks exist */}
              {subtasks.length > 0 && (
                <div className="bg-surface p-3 rounded-card border border-border-default space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-primary">Checklist Progress</span>
                    <span className="text-aqua-primary font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-aqua-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-canvas rounded-control border border-border-default">
                  <span className="text-text-muted block font-medium text-[11px] flex items-center space-x-1">
                    <UserCheck className="w-3 h-3 text-text-muted" />
                    <span>Assigned To</span>
                  </span>
                  <span className="font-semibold text-text-primary mt-1 block">
                    {task.assigneeUser?.fullName || 'Unassigned'}
                  </span>
                </div>

                <div className="p-3 bg-canvas rounded-control border border-border-default">
                  <span className="text-text-muted block font-medium text-[11px] flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-text-muted" />
                    <span>Branch / Facility</span>
                  </span>
                  <span className="font-semibold text-text-primary mt-1 block">
                    {task.facility?.name || task.facilityId}
                  </span>
                </div>

                <div className="p-3 bg-canvas rounded-control border border-border-default">
                  <span className="text-text-muted block font-medium text-[11px]">Created By</span>
                  <span className="font-semibold text-text-primary mt-1 block">
                    {task.creator?.fullName || task.creatorId}
                  </span>
                </div>

                <div className="p-3 bg-canvas rounded-control border border-border-default">
                  <span className="text-text-muted block font-medium text-[11px] flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-text-muted" />
                    <span>Due Date</span>
                  </span>
                  <span className="font-semibold text-text-primary mt-1 block">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
              </div>

              {/* Audit timestamps */}
              <div className="text-[11px] text-text-muted border-t border-border-subtle pt-2 flex justify-between">
                <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                {task.completedAt && (
                  <span className="text-emerald-600 font-semibold">
                    Completed: {new Date(task.completedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </>
          )}

          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="flex items-center justify-between text-xs p-2.5 bg-canvas rounded-card border border-border-default">
                <div>
                  <span className="text-text-secondary font-medium">Progress: </span>
                  <strong className="text-text-primary">{completedCount} of {subtasks.length} completed</strong>
                </div>
                <div className="w-32 bg-border-subtle rounded-full h-2 overflow-hidden ml-3">
                  <div
                    className="bg-aqua-primary h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Subtask Creation Form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a checklist item or subtask..."
                  className="flex-1 px-3 py-2 bg-surface border border-border-default rounded-control text-xs text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-aqua-primary hover:bg-aqua-hover text-white text-xs font-semibold rounded-control shadow-subtle flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Subtasks List */}
              <div className="space-y-2">
                {subtasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-card border border-border-default">
                    No subtasks added yet. Break down this task with smaller actionable steps.
                  </div>
                ) : (
                  subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2.5 bg-surface rounded-card border border-border-default hover:bg-canvas transition-colors text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(st.id, st.isCompleted)}
                        className="flex items-center space-x-2.5 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        {st.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-muted hover:text-aqua-primary shrink-0" />
                        )}
                        <span
                          className={`truncate ${
                            st.isCompleted
                              ? 'line-through text-text-muted'
                              : 'text-text-primary font-medium'
                          }`}
                        >
                          {st.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(st.id)}
                        className="p-1 text-text-muted hover:text-rose-600 transition-colors ml-2 cursor-pointer"
                        title="Delete subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Comment composer */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  rows={2}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Leave an operational update, feedback, or note..."
                  className="w-full p-2.5 bg-surface border border-border-default rounded-control text-xs text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-3.5 py-1.5 bg-aqua-primary hover:bg-aqua-hover disabled:opacity-50 text-white text-xs font-semibold rounded-control shadow-subtle flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Update</span>
                  </button>
                </div>
              </form>

              {/* Comments Feed */}
              <div className="space-y-3 pt-2">
                {comments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-card border border-border-default">
                    No activity notes posted on this task yet.
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-surface rounded-card border border-border-default space-y-1.5 text-xs shadow-subtle"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-text-primary">
                          {c.author?.fullName || 'User'}
                        </span>
                        <span className="text-text-muted">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Actions Bar */}
        <div className="border-t border-border-subtle pt-3 space-y-1.5 shrink-0">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            Change Lifecycle Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(task.id, st)}
                disabled={task.status === st}
                className={`px-2.5 py-1 text-xs rounded-control font-semibold border transition-all cursor-pointer ${
                  task.status === st
                    ? 'bg-aqua-primary text-white border-aqua-primary shadow-subtle cursor-default'
                    : 'bg-surface text-text-primary border-border-default hover:bg-canvas hover:border-aqua-primary/40'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-3 border-t border-border-subtle shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-control transition-colors font-semibold cursor-pointer"
          >
            Delete Task
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-text-primary text-white text-xs font-semibold rounded-control hover:bg-text-secondary transition-colors shadow-subtle cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
