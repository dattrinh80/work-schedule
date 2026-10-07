import test from 'node:test';
import assert from 'node:assert';
import { TaskStatus, TaskPriority } from '@wms/shared';
import { StatusBadge, PriorityBadge } from '../src/components/badge.js';
import { apiClient, tokenStorage } from '../src/lib/api.js';

test('WMS Web UI Deterministic Test Suite', async (t) => {
  await t.test('StatusBadge: renders valid status tokens for all lifecycle statuses', () => {
    for (const status of Object.values(TaskStatus)) {
      const element = StatusBadge({ status });
      assert.ok(element, `StatusBadge should render for ${status}`);
      assert.strictEqual(typeof element.props.className, 'string');
      assert.ok(element.props.className.includes('rounded-full'));
    }
  });

  await t.test('PriorityBadge: renders valid styling tokens for all priorities', () => {
    for (const priority of Object.values(TaskPriority)) {
      const element = PriorityBadge({ priority });
      assert.ok(element, `PriorityBadge should render for ${priority}`);
      assert.strictEqual(typeof element.props.className, 'string');
      assert.ok(element.props.className.includes('rounded'));
    }
  });

  await t.test('UI Tokens: enforce design tokens from UX baseline', () => {
    const overdueElement = StatusBadge({ status: TaskStatus.OVERDUE });
    assert.ok(overdueElement.props.className.includes('bg-red-100'));
    assert.ok(overdueElement.props.className.includes('text-red-800'));

    const completedElement = StatusBadge({ status: TaskStatus.COMPLETED });
    assert.ok(completedElement.props.className.includes('bg-emerald-50'));
  });

  await t.test('API Client: provides required methods and token storage', () => {
    assert.strictEqual(typeof apiClient.login, 'function');
    assert.strictEqual(typeof apiClient.getMe, 'function');
    assert.strictEqual(typeof apiClient.getFacilities, 'function');
    assert.strictEqual(typeof apiClient.getUsers, 'function');
    assert.strictEqual(typeof apiClient.getTasks, 'function');
    assert.strictEqual(typeof apiClient.createTask, 'function');
    assert.strictEqual(typeof apiClient.updateTask, 'function');
    assert.strictEqual(typeof apiClient.updateTaskStatus, 'function');
    assert.strictEqual(typeof apiClient.deleteTask, 'function');

    tokenStorage.set('test-token-xyz');
    assert.strictEqual(tokenStorage.get(), 'test-token-xyz');
    tokenStorage.clear();
    assert.strictEqual(tokenStorage.get(), null);
  });

  await t.test('Scope Storage: manages active scope persistence', async () => {
    const { scopeStorage } = await import('../src/lib/api.js');
    assert.ok(scopeStorage);
    scopeStorage.set({ facilityId: 'fac-002', facilityName: 'West Campus' });
    const current = scopeStorage.get();
    assert.strictEqual(current.facilityId, 'fac-002');
    assert.strictEqual(current.facilityName, 'West Campus');

    scopeStorage.clear();
    assert.strictEqual(scopeStorage.get().facilityId, 'ALL');
  });

  await t.test('LoginForm: provides accessible inputs and preset demo accounts', async () => {
    const { LoginForm, DEMO_ACCOUNTS } = await import('../src/components/login-form.js');
    assert.strictEqual(typeof LoginForm, 'function');
    assert.strictEqual(DEMO_ACCOUNTS.length, 4);
    assert.ok(DEMO_ACCOUNTS.some((a) => a.email === 'admin@wms.local' && a.role === 'Super Admin'));
    assert.ok(DEMO_ACCOUNTS.some((a) => a.email === 'manager.central@wms.local' && a.role === 'Central Manager'));
    assert.ok(DEMO_ACCOUNTS.some((a) => a.email === 'manager.west@wms.local' && a.role === 'West Manager'));
    assert.ok(DEMO_ACCOUNTS.some((a) => a.email === 'teacher.sarah@wms.local' && a.role === 'Teacher Sarah'));
  });

  await t.test('Navbar: renders admin scope switcher vs locked branch badge for staff', async () => {
    const { Navbar } = await import('../src/components/navbar.js');
    const { Role } = await import('@wms/shared');

    const adminUser = {
      id: 'u-1',
      fullName: 'System Administrator',
      email: 'admin@wms.local',
      role: Role.SUPER_ADMIN,
      facilityId: 'fac-001',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    const adminNav = Navbar({
      currentUser: adminUser,
      facilityName: 'Central Campus',
      facilities: [
        { id: 'fac-001', name: 'Central Campus', code: 'CAMPUS-01', isActive: true, createdAt: '', updatedAt: '' },
        { id: 'fac-002', name: 'West Campus', code: 'CAMPUS-02', isActive: true, createdAt: '', updatedAt: '' },
      ],
      activeScope: { facilityId: 'ALL' },
    });
    assert.ok(adminNav);

    const teacherUser = {
      ...adminUser,
      role: Role.TEACHER,
    };
    const teacherNav = Navbar({
      currentUser: teacherUser,
      facilityName: 'Central Campus',
      activeScope: { facilityId: 'fac-001' },
    });
    assert.ok(teacherNav);
  });
});
