'use client';

import React, { useState, useEffect } from 'react';
import { AssignmentTargetType, CreateTaskDto, Facility, TaskPriority, User } from '@wms/shared';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskDto) => void;
  facilities: Facility[];
  users: User[];
  defaultFacilityId: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  facilities,
  users,
  defaultFacilityId,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [facilityId, setFacilityId] = useState(defaultFacilityId);
  const [assigneeUserId, setAssigneeUserId] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (defaultFacilityId) {
      setFacilityId(defaultFacilityId);
    }
  }, [defaultFacilityId]);

  useEffect(() => {
    if (users.length > 0 && !assigneeUserId) {
      setAssigneeUserId(users[0].id);
    }
  }, [users, assigneeUserId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !facilityId) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      facilityId,
      assignmentTargetType: AssignmentTargetType.USER,
      assigneeUserId: assigneeUserId || undefined,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-modal shadow-modal max-w-lg w-full p-6 border border-border-default animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-border-subtle">
          <div>
            <h2 className="text-base font-bold text-text-primary">Create New Task</h2>
            <p className="text-xs text-text-secondary mt-0.5">Define operational details and assign to campus staff</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary font-medium text-sm p-1.5 rounded-control hover:bg-canvas transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-text-secondary mb-1.5 tracking-wider">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review IELTS Academic Class Roster"
              className="w-full px-3.5 py-2 bg-surface border border-border-default rounded-control text-xs text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-text-secondary mb-1.5 tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide actionable details, prerequisites, and instructions..."
              className="w-full px-3.5 py-2 bg-surface border border-border-default rounded-control text-xs text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase text-text-secondary mb-1.5 tracking-wider">
                Branch / Facility <span className="text-rose-500">*</span>
              </label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-control text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary transition-all"
              >
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-text-secondary mb-1.5 tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-control text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary transition-all"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase text-text-secondary mb-1.5 tracking-wider">
                Assignee
              </label>
              <select
                value={assigneeUserId}
                onChange={(e) => setAssigneeUserId(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-control text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary transition-all"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-text-secondary mb-1.5 tracking-wider">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-control text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border-default text-text-secondary text-xs font-semibold rounded-control hover:bg-canvas transition-colors shadow-subtle cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-aqua-primary hover:bg-aqua-hover text-white text-xs font-semibold rounded-control shadow-subtle transition-all cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
