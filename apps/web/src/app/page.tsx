'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveScope, CreateTaskDto, Facility, Role, Task, TaskStatus, User } from '@wms/shared';
import { Navbar } from '../components/navbar.js';
import { TaskList } from '../components/task-list.js';
import { CreateTaskModal } from '../components/create-task-modal.js';
import { TaskDetailModal } from '../components/task-detail-modal.js';
import { LoginForm } from '../components/login-form.js';
import { apiClient, tokenStorage, scopeStorage } from '../lib/api.js';

function getFallbackData(email: string) {
  const isSuperAdmin = email.includes('admin');
  const isCentralMgr = email.includes('central');
  const isWestMgr = email.includes('west');

  const role = isSuperAdmin
    ? Role.SUPER_ADMIN
    : isCentralMgr || isWestMgr
    ? Role.FACILITY_MANAGER
    : Role.TEACHER;

  const facilityId = isWestMgr ? 'fac-002' : 'fac-001';

  const user: User = {
    id: isSuperAdmin
      ? 'usr-admin-01'
      : isCentralMgr
      ? 'usr-mgr-central'
      : isWestMgr
      ? 'usr-mgr-west'
      : 'usr-staff-01',
    email,
    fullName: isSuperAdmin
      ? 'System Administrator'
      : isCentralMgr
      ? 'David Miller'
      : isWestMgr
      ? 'Elena Rostova'
      : 'Sarah Jenkins',
    role,
    facilityId: isSuperAdmin ? 'fac-001' : facilityId,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const facilities: Facility[] = [
    {
      id: 'fac-001',
      name: 'Central Campus',
      code: 'CAMPUS-01',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fac-002',
      name: 'West Campus',
      code: 'CAMPUS-02',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const tasks: Task[] = [
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
    {
      id: 'task-demo-02',
      title: 'Setup West Campus Multimedia Classrooms',
      description: 'Equip audio systems and interactive projectors for Semester 2.',
      status: TaskStatus.NEW,
      priority: 1 as any,
      facilityId: 'fac-002',
      creatorId: 'usr-admin-01',
      assignmentTargetType: 'USER' as any,
      assigneeUserId: 'usr-mgr-west',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      facility: { id: 'fac-002', name: 'West Campus', code: 'CAMPUS-02' },
      assigneeUser: { id: 'usr-mgr-west', fullName: 'Elena Rostova', email: 'manager.west@wms.local' },
    },
  ];

  const users: User[] = [
    user,
    {
      id: 'usr-admin-01',
      email: 'admin@wms.local',
      fullName: 'System Administrator',
      role: Role.SUPER_ADMIN,
      facilityId: 'fac-001',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-mgr-central',
      email: 'manager.central@wms.local',
      fullName: 'David Miller',
      role: Role.FACILITY_MANAGER,
      facilityId: 'fac-001',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-mgr-west',
      email: 'manager.west@wms.local',
      fullName: 'Elena Rostova',
      role: Role.FACILITY_MANAGER,
      facilityId: 'fac-002',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-staff-01',
      email: 'teacher.sarah@wms.local',
      fullName: 'Sarah Jenkins',
      role: Role.TEACHER,
      facilityId: 'fac-001',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { user, facilities, tasks, users };
}

export default function WmsApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeScope, setActiveScope] = useState<ActiveScope>({ facilityId: 'ALL' });

  const loadDataForScope = useCallback(
    async (scope: ActiveScope, user: User) => {
      try {
        setLoading(true);
        const [facRes, usrRes] = await Promise.all([
          apiClient.getFacilities(),
          apiClient.getUsers(),
        ]);
        setFacilities(facRes.facilities);
        setUsers(usrRes.users);

        let effectiveFacilityId: string | undefined = undefined;
        if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
          if (scope.facilityId !== 'ALL') {
            effectiveFacilityId = scope.facilityId;
          }
        } else if (user.facilityId) {
          effectiveFacilityId = user.facilityId;
        }

        const taskRes = await apiClient.getTasks(
          effectiveFacilityId ? { facilityId: effectiveFacilityId } : {},
        );
        setTasks(taskRes.tasks);
      } catch (err: any) {
        console.warn('Live data fetch failed, keeping local state:', err.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleLogin = async (email: string, password: string = 'Password123!') => {
    try {
      setLoading(true);
      setErrorMsg(null);
      let user: User;

      try {
        const res = await apiClient.login({ email, password });
        user = res.user;
      } catch (apiErr: any) {
        console.warn('Backend API connection failed, using resilient offline mode:', apiErr.message);
        const fb = getFallbackData(email);
        user = fb.user;
        setFacilities(fb.facilities);
        setUsers(fb.users);
        setTasks(fb.tasks);
        setErrorMsg('Notice: Backend API is not currently connected. Running in offline demo mode.');
      }

      setCurrentUser(user);

      let initialScope: ActiveScope = { facilityId: 'ALL' };
      if (user.role !== Role.SUPER_ADMIN && user.role !== Role.ADMIN) {
        initialScope = {
          facilityId: user.facilityId || 'fac-001',
          facilityName: 'Assigned Campus',
        };
      } else {
        const saved = scopeStorage.get();
        if (saved) initialScope = saved;
      }

      setActiveScope(initialScope);
      scopeStorage.set(initialScope);

      // Attempt live data sync if token is available
      if (tokenStorage.get()) {
        try {
          await loadDataForScope(initialScope, user);
        } catch {
          // fallback data already active
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    tokenStorage.clear();
    scopeStorage.clear();
    setCurrentUser(null);
    setTasks([]);
    setSelectedTask(null);
    setIsCreateModalOpen(false);
    setIsDetailModalOpen(false);
    setErrorMsg(null);
  };

  const handleScopeChange = async (newScope: ActiveScope) => {
    if (!currentUser) return;
    setActiveScope(newScope);
    scopeStorage.set(newScope);

    if (tokenStorage.get()) {
      await loadDataForScope(newScope, currentUser);
    } else {
      // Offline scope filtering
      const fb = getFallbackData(currentUser.email);
      if (newScope.facilityId === 'ALL') {
        setTasks(fb.tasks);
      } else {
        setTasks(fb.tasks.filter((t) => t.facilityId === newScope.facilityId));
      }
    }
  };

  useEffect(() => {
    const hydrateSession = async () => {
      const existingToken = tokenStorage.get();
      if (!existingToken) return;
      try {
        setLoading(true);
        const me = await apiClient.getMe();
        setCurrentUser(me);
        const savedScope = scopeStorage.get();
        setActiveScope(savedScope);
        await loadDataForScope(savedScope, me);
      } catch {
        tokenStorage.clear();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateSession();
  }, [loadDataForScope]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
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
      // Local addition
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

  if (!currentUser) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loading}
        error={errorMsg}
      />
    );
  }

  const activeFacilityObj = facilities.find((f) => f.id === activeScope.facilityId);
  const activeFacilityName =
    activeScope.facilityId === 'ALL'
      ? 'All Facilities'
      : activeFacilityObj
      ? `${activeFacilityObj.name} (${activeFacilityObj.code})`
      : 'Assigned Campus';

  const defaultFacilityIdForCreation =
    activeScope.facilityId !== 'ALL'
      ? activeScope.facilityId
      : currentUser.facilityId || facilities[0]?.id || 'fac-001';

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        facilityName={activeFacilityName}
        facilities={facilities}
        activeScope={activeScope}
        onScopeChange={handleScopeChange}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-indigo-900 font-medium">
            <span>Signed in as:</span>
            <strong className="text-zinc-900">{currentUser.fullName}</strong>
            <span className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded font-bold">
              {currentUser.role}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500">Quick Switch:</span>
            <button
              onClick={() => handleLogin('admin@wms.local')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                currentUser.email === 'admin@wms.local'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              Admin (Global)
            </button>
            <button
              onClick={() => handleLogin('manager.central@wms.local')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                currentUser.email === 'manager.central@wms.local'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              Central Mgr
            </button>
            <button
              onClick={() => handleLogin('manager.west@wms.local')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                currentUser.email === 'manager.west@wms.local'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              West Mgr
            </button>
            <button
              onClick={() => handleLogin('teacher.sarah@wms.local')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                currentUser.email === 'teacher.sarah@wms.local'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              Teacher Sarah
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs">
            {errorMsg}
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
          defaultFacilityId={defaultFacilityIdForCreation}
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
