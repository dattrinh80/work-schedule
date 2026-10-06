import React, { useState } from 'react';
import { Task, TaskStatus } from '@wms/shared';
import { StatusBadge, PriorityBadge } from './badge.js';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onOpenCreateModal: () => void;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({
  tasks,
  onStatusChange,
  onOpenCreateModal,
  onSelectTask,
  onDeleteTask,
}: TaskListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = tasks.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const filterOptions = [
    'ALL',
    TaskStatus.NEW,
    TaskStatus.IN_PROGRESS,
    TaskStatus.BLOCKED,
    TaskStatus.PENDING_REVIEW,
    TaskStatus.COMPLETED,
    TaskStatus.CANCELLED,
  ];

  return (
    <div className="space-y-4">
      {/* Action Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-1">
            Status:
          </span>
          {filterOptions.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
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
          <div className="p-12 text-center text-zinc-500 text-sm">
            No tasks found matching current filter.
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-zinc-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div
                onClick={() => onSelectTask(task)}
                className="space-y-1.5 flex-1 cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-zinc-900 text-sm hover:text-indigo-600 transition-colors">
                    {task.title}
                  </span>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                {task.description && (
                  <p className="text-xs text-zinc-500 line-clamp-1">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <span>
                    Assigned: <strong className="text-zinc-700">{task.assigneeUser?.fullName || 'Unassigned'}</strong>
                  </span>
                  <span>
                    Branch: <strong className="text-zinc-700">{task.facility?.name || task.facilityId}</strong>
                  </span>
                  {task.dueDate && (
                    <span>
                      Due: <strong className="text-zinc-700">{new Date(task.dueDate).toLocaleDateString()}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                  className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={TaskStatus.NEW}>New</option>
                  <option value={TaskStatus.ASSIGNED}>Assigned</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.BLOCKED}>Blocked</option>
                  <option value={TaskStatus.PENDING_REVIEW}>Pending Review</option>
                  <option value={TaskStatus.COMPLETED}>Completed</option>
                  <option value={TaskStatus.CANCELLED}>Cancelled</option>
                </select>

                <button
                  onClick={() => onSelectTask(task)}
                  className="px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors font-medium"
                >
                  Details
                </button>

                <button
                  onClick={() => {
                    if (confirm('Delete this task?')) {
                      onDeleteTask(task.id);
                    }
                  }}
                  className="px-2 py-1 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent rounded-lg transition-colors font-medium"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
