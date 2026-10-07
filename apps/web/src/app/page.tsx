'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveScope, CreateTaskDto, Facility, Role, Task, TaskStatus, User } from '@wms/shared';
import { Navbar } from '../components/navbar.js';
import { TaskList } from '../components/task-list.js';
import { CreateTaskModal } from '../components/create-task-modal.js';
import { TaskDetailModal } from '../components/task-detail-modal.js';
import { LoginForm } from '../components/login-form.js';
import { apiClient, tokenStorage, scopeStorage } from '../lib/api.js';

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

        // Determine effective facility filter based on user role and active scope
        let effectiveFacilityId: string | undefined = undefined;
        if (
          user.role === Role.SUPER_ADMIN ||
          user.role === Role.ADMIN
        ) {
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
        setErrorMsg(err.message || 'Failed to fetch live data from server');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Authenticate user with credentials
  const handleLogin = async (email: string, password: string = 'Password123!') => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiClient.login({ email, password });
      setCurrentUser(res.user);

      // Determine initial active scope
      let initialScope: ActiveScope = { facilityId: 'ALL' };
      if (res.user.role !== Role.SUPER_ADMIN && res.user.role !== Role.ADMIN) {
        initialScope = {
          facilityId: res.user.facilityId || 'fac-001',
          facilityName: 'Assigned Campus',
        };
      } else {
        const saved = scopeStorage.get();
        if (saved) initialScope = saved;
      }

      setActiveScope(initialScope);
      scopeStorage.set(initialScope);
      await loadDataForScope(initialScope, res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
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

  // Scope change handler (admins switching between facilities)
  const handleScopeChange = async (newScope: ActiveScope) => {
    if (!currentUser) return;
    setActiveScope(newScope);
    scopeStorage.set(newScope);
    await loadDataForScope(newScope, currentUser);
  };

  // Initial session hydration
  useEffect(() => {
    const hydrateSession = async () => {
      const existingToken = tokenStorage.get();
      if (!existingToken) {
        return;
      }
      try {
        setLoading(true);
        const me = await apiClient.getMe();
        setCurrentUser(me);
        const savedScope = scopeStorage.get();
        setActiveScope(savedScope);
        await loadDataForScope(savedScope, me);
      } catch {
        // Token invalid or expired
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
      console.warn('Failed to create task on backend:', err.message);
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

  // Unauthenticated view: Render dedicated Login screen
  if (!currentUser) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loading}
        error={errorMsg}
      />
    );
  }

  // Active facility display name
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
        {/* Quick Demo Switcher helper for review/testing */}
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
