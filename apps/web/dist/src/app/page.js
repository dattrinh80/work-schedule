'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Role, TaskPriority, TaskStatus, AssignmentTargetType } from '@wms/shared';
import { Navbar } from '../components/navbar.js';
import { TaskList } from '../components/task-list.js';
import { CreateTaskModal } from '../components/create-task-modal.js';
export default function WmsApp() {
    const [currentUser, setCurrentUser] = useState({
        id: 'usr-admin-01',
        email: 'admin@wms.local',
        fullName: 'System Administrator',
        role: Role.SUPER_ADMIN,
        facilityId: 'fac-001',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    const [tasks, setTasks] = useState([
        {
            id: 'task-demo-01',
            title: 'Review IELTS Academic Class Roster',
            description: 'Verify attendance prerequisites and prepare course materials.',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            facilityId: 'fac-001',
            creatorId: 'usr-admin-01',
            assignmentTargetType: AssignmentTargetType.USER,
            assigneeUserId: 'usr-staff-01',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assigneeUser: { id: 'usr-staff-01', fullName: 'Sarah Jenkins', email: 'teacher.sarah@wms.local' },
            facility: { id: 'fac-001', name: 'Central Campus', code: 'CAMPUS-01' },
        },
        {
            id: 'task-demo-02',
            title: 'Conduct Q4 Telesales Strategy Meeting',
            description: 'Align lead distribution quotas and conversion targets for branches.',
            status: TaskStatus.NEW,
            priority: TaskPriority.MEDIUM,
            facilityId: 'fac-001',
            creatorId: 'usr-admin-01',
            assignmentTargetType: AssignmentTargetType.USER,
            assigneeUserId: 'usr-admin-01',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assigneeUser: { id: 'usr-admin-01', fullName: 'System Administrator', email: 'admin@wms.local' },
            facility: { id: 'fac-001', name: 'Central Campus', code: 'CAMPUS-01' },
        },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleStatusChange = (taskId, newStatus) => {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    };
    const handleCreateTask = (dto) => {
        const newTask = {
            id: `task-${Date.now()}`,
            title: dto.title,
            description: dto.description || null,
            status: dto.assigneeUserId ? TaskStatus.ASSIGNED : TaskStatus.NEW,
            priority: dto.priority || TaskPriority.MEDIUM,
            facilityId: dto.facilityId,
            creatorId: currentUser?.id || 'usr-admin-01',
            assignmentTargetType: dto.assignmentTargetType || AssignmentTargetType.USER,
            assigneeUserId: dto.assigneeUserId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assigneeUser: {
                id: dto.assigneeUserId || '',
                fullName: dto.assigneeUserId === 'usr-staff-01' ? 'Sarah Jenkins' : 'System Administrator',
                email: 'user@wms.local',
            },
            facility: { id: 'fac-001', name: 'Central Campus', code: 'CAMPUS-01' },
        };
        setTasks((prev) => [newTask, ...prev]);
    };
    return (_jsxs("div", { className: "min-h-screen bg-zinc-50 flex flex-col font-sans", children: [_jsx(Navbar, { currentUser: currentUser, facilityName: "Central Campus (CAMPUS-01)", onLogout: () => setCurrentUser(null) }), _jsxs("main", { className: "flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6", children: [_jsx("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-zinc-900 tracking-tight", children: "Operational Task Board" }), _jsx("p", { className: "text-sm text-zinc-500", children: "Manage cross-facility assignments, academic schedules, and operational workflows." })] }) }), _jsx(TaskList, { tasks: tasks, onStatusChange: handleStatusChange, onOpenCreateModal: () => setIsModalOpen(true) }), _jsx(CreateTaskModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onSubmit: handleCreateTask, facilityId: "fac-001" })] })] }));
}
