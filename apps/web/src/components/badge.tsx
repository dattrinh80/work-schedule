import React from 'react';
import { TaskPriority, TaskStatus } from '@wms/shared';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    [TaskStatus.NEW]: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    [TaskStatus.ASSIGNED]: 'bg-sky-50 text-sky-700 border-sky-200',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
    [TaskStatus.BLOCKED]: 'bg-amber-50 text-amber-700 border-amber-200',
    [TaskStatus.PENDING_REVIEW]: 'bg-purple-50 text-purple-700 border-purple-200',
    [TaskStatus.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [TaskStatus.CANCELLED]: 'bg-zinc-100 text-zinc-500 border-zinc-200 line-through',
    [TaskStatus.OVERDUE]: 'bg-red-100 text-red-800 border-red-300 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
        styles[status] || styles[TaskStatus.NEW]
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'text-slate-600 bg-slate-100 border-slate-200',
    [TaskPriority.MEDIUM]: 'text-blue-700 bg-blue-100 border-blue-200',
    [TaskPriority.HIGH]: 'text-amber-800 bg-amber-100 border-amber-200',
    [TaskPriority.URGENT]: 'text-rose-800 bg-rose-100 border-rose-200 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
        styles[priority] || styles[TaskPriority.MEDIUM]
      }`}
    >
      {priority}
    </span>
  );
}
