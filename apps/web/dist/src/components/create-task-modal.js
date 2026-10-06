import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AssignmentTargetType, TaskPriority } from '@wms/shared';
export function CreateTaskModal({ isOpen, onClose, onSubmit, facilityId }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(TaskPriority.MEDIUM);
    const [assigneeUserId, setAssigneeUserId] = useState('usr-staff-01');
    if (!isOpen)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim())
            return;
        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            facilityId,
            assignmentTargetType: AssignmentTargetType.USER,
            assigneeUserId: assigneeUserId || undefined,
        });
        setTitle('');
        setDescription('');
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-zinc-200", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg font-bold text-zinc-900", children: "Create New Task" }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-zinc-600 font-medium text-sm", children: "\u2715" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase text-zinc-600 mb-1", children: "Task Title *" }), _jsx("input", { type: "text", required: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g., Prepare IELTS Mock Test Roster", className: "w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase text-zinc-600 mb-1", children: "Description" }), _jsx("textarea", { rows: 3, value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Provide actionable details and instructions...", className: "w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase text-zinc-600 mb-1", children: "Priority" }), _jsxs("select", { value: priority, onChange: (e) => setPriority(e.target.value), className: "w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white", children: [_jsx("option", { value: TaskPriority.LOW, children: "Low" }), _jsx("option", { value: TaskPriority.MEDIUM, children: "Medium" }), _jsx("option", { value: TaskPriority.HIGH, children: "High" }), _jsx("option", { value: TaskPriority.URGENT, children: "Urgent" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase text-zinc-600 mb-1", children: "Assignee" }), _jsxs("select", { value: assigneeUserId, onChange: (e) => setAssigneeUserId(e.target.value), className: "w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white", children: [_jsx("option", { value: "usr-staff-01", children: "Sarah Jenkins (Teacher)" }), _jsx("option", { value: "usr-admin-01", children: "System Administrator" })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-3 border-t border-zinc-100", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm", children: "Create Task" })] })] })] }) }));
}
