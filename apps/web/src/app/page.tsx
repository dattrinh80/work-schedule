import React, { useState, useEffect, useCallback } from 'react';
import { CreateTaskDto, Facility, Role, Task, TaskStatus, User } from '@wms/shared';
import { Navbar } from '../components/navbar.js';
import { TaskList } from '../components/task-list.js';
import { CreateTaskModal } from '../components/create-task-modal.js';
import { TaskDetailModal } from '../components/task-detail-modal.js';
import { apiClient, tokenStorage } from '../lib/api.js';

export default function WmsApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authenticate user with demo credentials
  const authenticate = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiClient.login({
        email,
        password: 'Password123!',
      });
      setCurrentUser(res.user);
      await loadInitialData();
    } catch (err: any) {
      console.warn('API login failed, using fallback authenticated profile:', err.message);
      // Fallback offline mock profile if backend is not actively running during static rendering
      const fallbackUser: User = {
        id: email.includes('admin') ? 'usr-admin-01' : 'usr-staff-01',
        email,
        fullName: email.includes('admin') ? 'System Administrator' : 'Sarah Jenkins',
        role: email.includes('admin') ? Role.SUPER_ADMIN : Role.TEACHER,
        facilityId: 'fac-001',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(fallbackUser);
      setFacilities([
        {
          id: 'fac-001',
          name: 'Central Campus',
          code: 'CAMPUS-01',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      setUsers([fallbackUser]);
      setTasks([
        {
          id: 'task-demo-01',
          title: 'Review IELTS Academic Class Roster',
          description: 'Verify attendance prerequisites and prepare course materials.',
          status: TaskStatus.IN_PROGRESS,
          priority: 2 as any,
          facilityId: 'fac-001',
          creatorId: 'usr-admin-01',
          assignmentTargetType: 'USER' as any,
          assigneeUserId: 'usr-staff-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          facility: { id: 'fac-001', name: 'Central Campus', code: 'CAMPUS-01' },
          assigneeUser: { id: 'usr-staff-01', fullName: 'Sarah Jenkins', email: 'teacher.sarah@wms.local' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [facRes, usrRes, taskRes] = await Promise.all([
        apiClient.getFacilities(),
        apiClient.getUsers(),
        apiClient.getTasks(),
      ]);
      setFacilities(facRes.facilities);
      setUsers(usrRes.users);
      setTasks(taskRes.tasks);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch live data from server');
    }
  };

  useEffect(() => {
    authenticate('admin@wms.local');
  }, [authenticate]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await apiClient.updateTaskStatus(taskId, newStatus);
    } catch (err: any) {
      console.warn('Backend update failed:', err.message);
    }
  };

  const handleCreateTask = async (dto: CreateTaskDto) => {
    try {
      setLoading(true);
      const created = await apiClient.createTask(dto);
      setTasks((prev) => [created, ...prev]);
    } catch (err: any) {
      // Optimistic fallback
      const fallbackTask: Task = {
        id: `task-${Date.now()}`,
        title: dto.title,
        description: dto.description || null,
        status: dto.assigneeUserId ? TaskStatus.ASSIGNED : TaskStatus.NEW,
        priority: dto.priority || (1 as any),
        facilityId: dto.facilityId,
        creatorId: currentUser?.id || 'usr-admin-01',
        assignmentTargetType: dto.assignmentTargetType || ('USER' as any),
        assigneeUserId: dto.assigneeUserId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        facility: facilities.find((f) => f.id === dto.facilityId) || null,
        assigneeUser: users.find((u) => u.id === dto.assigneeUserId) || null,
      };
      setTasks((prev) => [fallbackTask, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setIsDetailModalOpen(false);
      setSelectedTask(null);
    }

    try {
      await apiClient.deleteTask(taskId);
    } catch (err: any) {
      console.warn('Backend delete error:', err.message);
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        facilityName={facilities[0]?.name ? `${facilities[0].name} (${facilities[0].code})` : 'Central Campus'}
        onLogout={() => {
          tokenStorage.clear();
          setCurrentUser(null);
        }}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Account Switcher Bar for Role Evaluation */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-indigo-900 font-medium">
            <span>Role Context Switcher:</span>
            <span className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded font-bold">
              {currentUser?.role || 'Guest'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500">Switch user:</span>
            <button
              onClick={() => authenticate('admin@wms.local')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                currentUser?.email === 'admin@wms.local'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              Admin (Global Scope)
            </button>
            <button
              onClick={() => authenticate('teacher.sarah@wms.local')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                currentUser?.email === 'teacher.sarah@wms.local'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              Teacher Sarah (Branch Scope)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs">
            Notice: {errorMsg}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Operational Task Board
            </h1>
            <p className="text-sm text-zinc-500">
              Manage cross-facility assignments, academic schedules, and operational workflows.
            </p>
          </div>
        </div>

        {loading && tasks.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm bg-white rounded-xl border border-zinc-200">
            Loading operational tasks...
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onSelectTask={handleSelectTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
          facilities={facilities}
          users={users}
          defaultFacilityId={facilities[0]?.id || 'fac-001'}
        />

        <TaskDetailModal
          isOpen={isDetailModalOpen}
          task={selectedTask}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTask(null);
          }}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteTask}
        />
      </main>
    </div>
  );
}
