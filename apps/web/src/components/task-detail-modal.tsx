'use client';

import React from 'react';
import { Task, TaskStatus } from '@wms/shared';
import { StatusBadge, PriorityBadge } from './badge.js';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: TaskDetailModalProps) {
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
      <div className="bg-surface rounded-modal shadow-modal max-w-lg w-full p-6 border border-border-default space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 pb-3 border-b border-border-subtle">
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-zinc-900 leading-snug">
              {task.title}
            </h2>
            <div className="flex items-center space-x-2 pt-0.5">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 font-medium text-sm p-1.5 rounded-control hover:bg-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="bg-surface-subtle rounded-card p-3.5 border border-border-default">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Description
          </div>
          <p className="text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-surface-subtle rounded-control border border-border-default">
            <span className="text-zinc-400 block font-medium text-[11px]">Assigned To</span>
            <span className="font-semibold text-zinc-800 mt-0.5 block">
              {task.assigneeUser?.fullName || 'Unassigned'}
            </span>
          </div>

          <div className="p-3 bg-surface-subtle rounded-control border border-border-default">
            <span className="text-zinc-400 block font-medium text-[11px]">Branch / Facility</span>
            <span className="font-semibold text-zinc-800 mt-0.5 block">
              {task.facility?.name || task.facilityId}
            </span>
          </div>

          <div className="p-3 bg-surface-subtle rounded-control border border-border-default">
            <span className="text-zinc-400 block font-medium text-[11px]">Created By</span>
            <span className="font-semibold text-zinc-800 mt-0.5 block">
              {task.creator?.fullName || task.creatorId}
            </span>
          </div>

          <div className="p-3 bg-surface-subtle rounded-control border border-border-default">
            <span className="text-zinc-400 block font-medium text-[11px]">Due Date</span>
            <span className="font-semibold text-zinc-800 mt-0.5 block">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
            </span>
          </div>
        </div>

        {/* Audit timestamps */}
        <div className="text-[11px] text-zinc-400 border-t border-border-subtle pt-2 flex justify-between">
          <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
          {task.completedAt && (
            <span className="text-emerald-600 font-semibold">
              Completed: {new Date(task.completedAt).toLocaleString()}
            </span>
          )}
        </div>

        {/* Status Actions */}
        <div className="border-t border-border-subtle pt-3 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Change Lifecycle Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(task.id, st)}
                disabled={task.status === st}
                className={`px-2.5 py-1 text-xs rounded-control font-semibold border transition-all ${
                  task.status === st
                    ? 'bg-brand-600 text-white border-brand-600 shadow-subtle cursor-default'
                    : 'bg-surface text-zinc-700 border-border-default hover:bg-zinc-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-control transition-colors font-semibold"
          >
            Delete Task
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-control hover:bg-zinc-800 transition-colors shadow-subtle"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
