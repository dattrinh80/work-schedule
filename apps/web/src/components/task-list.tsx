'use client';

import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '@wms/shared';
import { StatusBadge, PriorityBadge } from './badge.js';
import {
  Search,
  RotateCcw,
  Plus,
  LayoutList,
  LayoutGrid,
  ChevronDown,
  User,
  Building2,
  Calendar,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterDueDate, setFilterDueDate] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('DUE_ASC');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Status counts for pills
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: tasks.length,
      [TaskStatus.NEW]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.BLOCKED]: 0,
      [TaskStatus.PENDING_REVIEW]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.CANCELLED]: 0,
    };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
      }
    });
    return counts;
  }, [tasks]);

  const statusTabs = [
    { key: 'ALL', label: 'All', count: statusCounts['ALL'] || 0 },
    { key: TaskStatus.NEW, label: 'New', count: statusCounts[TaskStatus.NEW] || 0 },
    { key: TaskStatus.IN_PROGRESS, label: 'In Progress', count: statusCounts[TaskStatus.IN_PROGRESS] || 0 },
    { key: TaskStatus.BLOCKED, label: 'Blocked', count: statusCounts[TaskStatus.BLOCKED] || 0 },
    { key: TaskStatus.PENDING_REVIEW, label: 'Pending Review', count: statusCounts[TaskStatus.PENDING_REVIEW] || 0 },
    { key: TaskStatus.COMPLETED, label: 'Completed', count: statusCounts[TaskStatus.COMPLETED] || 0 },
    { key: TaskStatus.CANCELLED, label: 'Cancelled', count: statusCounts[TaskStatus.CANCELLED] || 0 },
  ];

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
        if (filterPriority !== 'ALL' && String(t.priority) !== filterPriority) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesDesc = t.description?.toLowerCase().includes(q) || false;
          const matchesAssignee = t.assigneeUser?.fullName?.toLowerCase().includes(q) || false;
          const matchesBranch = t.facility?.name?.toLowerCase().includes(q) || false;
          if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesBranch) return false;
        }
        if (filterDueDate !== 'ALL') {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate).getTime();
          const now = Date.now();
          if (filterDueDate === 'OVERDUE' && due >= now) return false;
          if (filterDueDate === 'TODAY') {
            const todayStr = new Date().toDateString();
            if (new Date(t.dueDate).toDateString() !== todayStr) return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'DUE_ASC') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'DUE_DESC') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (sortBy === 'TITLE_ASC') {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, filterStatus, filterPriority, filterDueDate, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setFilterStatus('ALL');
    setSearchQuery('');
    setFilterPriority('ALL');
    setFilterDueDate('ALL');
  };

  const toggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const getPriorityBorderColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'border-l-rose-500';
      case TaskPriority.HIGH:
        return 'border-l-amber-500';
      case TaskPriority.MEDIUM:
        return 'border-l-brand-500';
      default:
        return 'border-l-zinc-300';
    }
  };

  const getStatusDotColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-600';
      case TaskStatus.COMPLETED:
        return 'bg-emerald-600';
      case TaskStatus.BLOCKED:
        return 'bg-amber-500';
      case TaskStatus.PENDING_REVIEW:
        return 'bg-purple-600';
      case TaskStatus.CANCELLED:
        return 'bg-zinc-400';
      default:
        return 'bg-zinc-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Tasks Title Row & Deep Aqua Create Task CTA */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
          Tasks
        </h2>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-aqua-primary hover:bg-aqua-hover text-white text-xs font-bold rounded-control shadow-subtle transition-all shrink-0 active:bg-aqua-active"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Task</span>
        </button>
      </div>

      {/* 2. Status Filter Segment Pills (Aqua Themed) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((tab) => {
          const isActive = filterStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-aqua-primary text-white shadow-subtle'
                  : 'bg-surface text-text-secondary hover:text-text-primary border border-border-default hover:bg-surface-secondary'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-surface-secondary text-text-muted border border-border-subtle'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Operational Filter Bar (White Surface) */}
      <div className="bg-surface p-3 rounded-card border border-border-default shadow-subtle flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description, assignee..."
            className="w-full pl-9 pr-3 py-2 bg-surface text-xs text-text-primary placeholder-text-muted border border-border-default rounded-control focus:outline-none focus:ring-2 focus:ring-aqua-focus/20 focus:border-aqua-primary transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Priority filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-text-muted font-medium">Priority</span>
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="pl-2.5 pr-7 py-2 bg-surface border border-border-default rounded-control text-xs font-medium text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-aqua-primary"
              >
                <option value="ALL">All</option>
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status secondary filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-text-muted font-medium">Status</span>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-2.5 pr-7 py-2 bg-surface border border-border-default rounded-control text-xs font-medium text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-aqua-primary"
              >
                <option value="ALL">All</option>
                <option value={TaskStatus.NEW}>New</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.BLOCKED}>Blocked</option>
                <option value={TaskStatus.PENDING_REVIEW}>Pending Review</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
                <option value={TaskStatus.CANCELLED}>Cancelled</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Due date filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-text-muted font-medium">Due Date</span>
            <div className="relative">
              <select
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value)}
                className="pl-2.5 pr-7 py-2 bg-surface border border-border-default rounded-control text-xs font-medium text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-aqua-primary"
              >
                <option value="ALL">Any time</option>
                <option value="TODAY">Due Today</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary border border-border-default rounded-control hover:bg-surface-secondary transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-text-muted" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 4. Results Summary, Sort & Layout Switcher */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="text-text-secondary font-medium">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-text-muted">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-2.5 pr-7 py-1.5 bg-surface border border-border-default rounded-control text-xs font-medium text-text-primary appearance-none cursor-pointer focus:outline-none"
              >
                <option value="DUE_ASC">Due Date (Asc)</option>
                <option value="DUE_DESC">Due Date (Desc)</option>
                <option value="TITLE_ASC">Title (A-Z)</option>
                <option value="NEWEST">Newest First</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-surface-secondary p-0.5 rounded-control border border-border-default">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${
                viewMode === 'list'
                  ? 'bg-surface text-aqua-primary shadow-subtle'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${
                viewMode === 'grid'
                  ? 'bg-surface text-aqua-primary shadow-subtle'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Task Items Container */}
      {filteredTasks.length === 0 ? (
        <div className="bg-surface rounded-card border border-border-default p-12 text-center shadow-subtle">
          <div className="max-w-sm mx-auto space-y-2">
            <p className="text-sm font-semibold text-text-primary">No operational tasks found</p>
            <p className="text-xs text-text-secondary">
              Try adjusting your search criteria, clearing filters, or create a new operational task.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-3 inline-flex items-center space-x-1.5 text-xs text-aqua-primary font-semibold hover:underline"
            >
              <span>Reset all filters</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isChecked = selectedTaskIds.has(task.id);
            const borderAccentClass = getPriorityBorderColor(task.priority);
            const dotColorClass = getStatusDotColor(task.status);

            return (
              <div
                key={task.id}
                className={`bg-surface rounded-card border border-border-default shadow-card border-l-4 ${borderAccentClass} p-4 transition-all hover:shadow-dropdown`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left: Checkbox + Content Details */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectTask(task.id)}
                      className="mt-1 w-4 h-4 rounded text-aqua-primary border-border-default focus:ring-aqua-focus cursor-pointer shrink-0"
                    />

                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Title + Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="font-bold text-text-primary text-sm hover:text-aqua-primary transition-colors text-left"
                        >
                          {task.title}
                        </button>
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Metadata Row: Assignee, Branch, Due Date */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-5 text-xs text-text-secondary pt-0.5">
                        <span className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-text-muted" />
                          <span>
                            Assigned to: <strong className="text-text-primary font-medium">{task.assigneeUser?.fullName || 'Unassigned'}</strong>
                          </span>
                        </span>

                        <span className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-text-muted" />
                          <span>
                            Branch: <strong className="text-text-primary font-medium">{task.facility?.name || task.facilityId}</strong>
                          </span>
                        </span>

                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          <span>
                            Due date: <strong className="text-text-primary font-medium">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                            </strong>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Status Selector, Details Button, Overflow Menu */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    {/* Status quick select with colored dot */}
                    <div className="relative inline-flex items-center">
                      <span className={`w-2 h-2 rounded-full ${dotColorClass} absolute left-3 pointer-events-none`} />
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        className="pl-7 pr-7 py-1.5 bg-surface border border-border-default rounded-control text-xs font-semibold text-text-primary appearance-none cursor-pointer hover:bg-surface-secondary focus:outline-none focus:border-aqua-primary shadow-subtle"
                      >
                        <option value={TaskStatus.NEW}>New</option>
                        <option value={TaskStatus.ASSIGNED}>Assigned</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.BLOCKED}>Blocked</option>
                        <option value={TaskStatus.PENDING_REVIEW}>Pending Review</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                        <option value={TaskStatus.CANCELLED}>Cancelled</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 pointer-events-none" />
                    </div>

                    {/* Details modal button */}
                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="px-3 py-1.5 text-xs font-semibold text-text-primary bg-surface hover:bg-surface-secondary border border-border-default rounded-control shadow-subtle transition-colors"
                    >
                      Details
                    </button>

                    {/* Overflow actions menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenActionMenuId(openActionMenuId === task.id ? null : task.id)
                        }
                        className="p-1.5 rounded-control text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openActionMenuId === task.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-surface rounded-card border border-border-default shadow-dropdown py-1 z-20 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenActionMenuId(null);
                              onSelectTask(task);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-surface-secondary text-text-primary"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenActionMenuId(null);
                              if (confirm('Delete this task?')) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-medium"
                          >
                            Delete Task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-text-muted pt-2 px-1">
        <span>
          Showing 1–{filteredTasks.length} of {filteredTasks.length} results
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            disabled
            className="p-1.5 rounded-control border border-border-default text-text-muted/40 cursor-not-allowed bg-surface"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-control bg-aqua-primary text-white font-bold flex items-center justify-center text-xs shadow-subtle"
          >
            1
          </button>
          <button
            type="button"
            disabled
            className="p-1.5 rounded-control border border-border-default text-text-muted/40 cursor-not-allowed bg-surface"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
