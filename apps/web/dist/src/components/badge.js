import { jsx as _jsx } from "react/jsx-runtime";
import { TaskPriority, TaskStatus } from '@wms/shared';
export function StatusBadge({ status }) {
    const styles = {
        [TaskStatus.NEW]: 'bg-zinc-100 text-zinc-800 border-zinc-200',
        [TaskStatus.ASSIGNED]: 'bg-sky-50 text-sky-700 border-sky-200',
        [TaskStatus.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
        [TaskStatus.BLOCKED]: 'bg-amber-50 text-amber-700 border-amber-200',
        [TaskStatus.PENDING_REVIEW]: 'bg-purple-50 text-purple-700 border-purple-200',
        [TaskStatus.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        [TaskStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200',
        [TaskStatus.OVERDUE]: 'bg-red-100 text-red-800 border-red-300 font-semibold',
    };
    return (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles[TaskStatus.NEW]}`, children: status.replace('_', ' ') }));
}
export function PriorityBadge({ priority }) {
    const styles = {
        [TaskPriority.LOW]: 'text-slate-600 bg-slate-100',
        [TaskPriority.MEDIUM]: 'text-blue-700 bg-blue-100',
        [TaskPriority.HIGH]: 'text-amber-800 bg-amber-100',
        [TaskPriority.URGENT]: 'text-rose-800 bg-rose-100 font-bold',
    };
    return (_jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${styles[priority] || styles[TaskPriority.MEDIUM]}`, children: priority }));
}
