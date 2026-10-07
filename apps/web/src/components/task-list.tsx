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
    <div className="space-y-5">
      {/* 1. Status Filter Pills & Create Task Button Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Horizontal scrollable status pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-subtle'
                    : 'bg-surface text-zinc-600 hover:text-zinc-900 border border-border-default hover:bg-zinc-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-control shadow-subtle transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* 2. Filter & Search Controls Bar */}
      <div className="bg-surface p-3 rounded-card border border-border-default shadow-subtle flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description, assignee..."
            className="w-full pl-9 pr-3 py-2 bg-surface text-xs text-zinc-900 placeholder-zinc-400 border border-border-default rounded-control focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Priority filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-zinc-500 font-medium">Priority</span>
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="pl-2.5 pr-7 py-2 bg-surface border border-border-default rounded-control text-xs font-medium text-zinc-800 appearance-none cursor-pointer focus:outline-none focus:border-brand-600"
              >
                <option value="ALL">All</option>
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status secondary filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-zinc-500 font-medium">Status</span>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-2.5 pr-7 py-2 bg-surface border border-border-default rounded-control text-xs font-medium text-zinc-800 appearance-none cursor-pointer focus:outline-none focus:border-brand-600"
              >
                <option value="ALL">All</option>
                <option value={TaskStatus.NEW}>New</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.BLOCKED}>Blocked</option>
                <option value={TaskStatus.PENDING_REVIEW}>Pending Review</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
                <option value={TaskStatus.CANCELLED}>Cancelled</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Due date filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-zinc-500 font-medium">Due Date</span>
            <div className="relative">
              <select
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value)}
                className="pl-2.5 pr-7 py-2 bg-surface border border-border-default rounded-control text-xs font-medium text-zinc-800 appearance-none cursor-pointer focus:outline-none focus:border-brand-600"
              >
                <option value="ALL">Any time</option>
                <option value="TODAY">Due Today</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-border-default rounded-control hover:bg-zinc-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 3. Results Summary, Sort & Layout Switcher */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="text-zinc-500 font-medium">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-zinc-400">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-2.5 pr-7 py-1.5 bg-surface border border-border-default rounded-control text-xs font-medium text-zinc-800 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="DUE_ASC">Due Date (Asc)</option>
                <option value="DUE_DESC">Due Date (Desc)</option>
                <option value="TITLE_ASC">Title (A-Z)</option>
                <option value="NEWEST">Newest First</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-control border border-border-default">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${
                viewMode === 'list'
                  ? 'bg-surface text-brand-600 shadow-subtle'
                  : 'text-zinc-500 hover:text-zinc-800'
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
                  ? 'bg-surface text-brand-600 shadow-subtle'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Task Items Container */}
      {filteredTasks.length === 0 ? (
        <div className="bg-surface rounded-card border border-border-default p-12 text-center shadow-subtle">
          <div className="max-w-sm mx-auto space-y-2">
            <p className="text-sm font-semibold text-zinc-800">No operational tasks found</p>
            <p className="text-xs text-zinc-500">
              Try adjusting your search criteria, clearing filters, or create a new operational task.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-3 inline-flex items-center space-x-1.5 text-xs text-brand-600 font-semibold hover:underline"
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
                      className="mt-1 w-4 h-4 rounded text-brand-600 border-border-default focus:ring-brand-500 cursor-pointer shrink-0"
                    />

                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Title + Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="font-bold text-zinc-900 text-sm hover:text-brand-600 transition-colors text-left"
                        >
                          {task.title}
                        </button>
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-zinc-500 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Metadata Row: Assignee, Branch, Due Date */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-500 pt-0.5">
                        <span className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          <span>
                            Assigned: <strong className="text-zinc-800 font-medium">{task.assigneeUser?.fullName || 'Unassigned'}</strong>
                          </span>
                        </span>

                        <span className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>
                            Branch: <strong className="text-zinc-800 font-medium">{task.facility?.name || task.facilityId}</strong>
                          </span>
                        </span>

                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>
                            Due: <strong className="text-zinc-800 font-medium">
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
                        className="pl-7 pr-7 py-1.5 bg-surface border border-border-default rounded-control text-xs font-semibold text-zinc-800 appearance-none cursor-pointer hover:bg-zinc-50 focus:outline-none focus:border-brand-600 shadow-subtle"
                      >
                        <option value={TaskStatus.NEW}>New</option>
                        <option value={TaskStatus.ASSIGNED}>Assigned</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.BLOCKED}>Blocked</option>
                        <option value={TaskStatus.PENDING_REVIEW}>Pending Review</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                        <option value={TaskStatus.CANCELLED}>Cancelled</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 pointer-events-none" />
                    </div>

                    {/* Details modal button */}
                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-surface hover:bg-zinc-50 border border-border-default rounded-control shadow-subtle transition-colors"
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
                        className="p-1.5 rounded-control text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
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
                            className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 text-zinc-700"
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

      {/* 5. Pagination Footer matching reference */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 px-1">
        <span>
          Showing 1–{filteredTasks.length} of {filteredTasks.length} results
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            disabled
            className="p-1.5 rounded-control border border-border-default text-zinc-300 cursor-not-allowed bg-surface"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-control bg-brand-600 text-white font-bold flex items-center justify-center text-xs shadow-subtle"
          >
            1
          </button>
          <button
            type="button"
            disabled
            className="p-1.5 rounded-control border border-border-default text-zinc-300 cursor-not-allowed bg-surface"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
