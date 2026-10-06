import React, { useState } from 'react';
import { Task, TaskStatus } from '@wms/shared';
import { StatusBadge, PriorityBadge } from './badge.js';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onOpenCreateModal: () => void;
}

export function TaskList({ tasks, onStatusChange, onOpenCreateModal }: TaskListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = tasks.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-4">
      {/* Action Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Status:
          </span>
          <div className="flex flex-wrap gap-1">
            {['ALL', TaskStatus.NEW, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    filterStatus === st
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ),
            )}
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
        >
          <span>+ Create Task</span>
        </button>
      </div>

      {/* Task Cards Container */}
      <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No tasks found matching current filter.
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-zinc-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-zinc-900 text-sm hover:underline cursor-pointer">
                    {task.title}
                  </span>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                {task.description && (
                  <p className="text-xs text-zinc-500 line-clamp-1">{task.description}</p>
                )}
                <div className="flex items-center space-x-4 text-xs text-zinc-400">
                  <span>Assigned to: <strong className="text-zinc-600">{task.assigneeUser?.fullName || 'Unassigned'}</strong></span>
                  <span>Branch: <strong className="text-zinc-600">{task.facility?.name || task.facilityId}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {task.status !== TaskStatus.COMPLETED ? (
                  <button
                    onClick={() => onStatusChange(task.id, TaskStatus.COMPLETED)}
                    className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    ✓ Mark Done
                  </button>
                ) : (
                  <button
                    onClick={() => onStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                    className="px-3 py-1 text-xs font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
