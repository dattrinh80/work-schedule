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
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-zinc-200 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 leading-snug">
              {task.title}
            </h2>
            <div className="flex items-center space-x-2 pt-1">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 font-medium text-sm p-1"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
          <div className="text-xs font-semibold uppercase text-zinc-500 mb-1">
            Description
          </div>
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
            <span className="text-zinc-400 block font-medium">Assigned To</span>
            <span className="font-semibold text-zinc-800">
              {task.assigneeUser?.fullName || 'Unassigned'}
            </span>
          </div>

          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
            <span className="text-zinc-400 block font-medium">Branch / Facility</span>
            <span className="font-semibold text-zinc-800">
              {task.facility?.name || task.facilityId}
            </span>
          </div>

          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
            <span className="text-zinc-400 block font-medium">Created By</span>
            <span className="font-semibold text-zinc-800">
              {task.creator?.fullName || task.creatorId}
            </span>
          </div>

          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
            <span className="text-zinc-400 block font-medium">Due Date</span>
            <span className="font-semibold text-zinc-800">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
            </span>
          </div>
        </div>

        {/* Audit timestamps */}
        <div className="text-[11px] text-zinc-400 border-t border-zinc-100 pt-2 flex justify-between">
          <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
          {task.completedAt && (
            <span className="text-emerald-600 font-medium">
              Completed: {new Date(task.completedAt).toLocaleString()}
            </span>
          )}
        </div>

        {/* Status Actions */}
        <div className="border-t border-zinc-100 pt-3 space-y-2">
          <label className="block text-xs font-semibold uppercase text-zinc-600">
            Change Lifecycle Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(task.id, st)}
                disabled={task.status === st}
                className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                  task.status === st
                    ? 'bg-zinc-800 text-white border-zinc-800 cursor-default'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors font-medium"
          >
            Delete Task
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
