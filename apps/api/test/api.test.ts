import test from 'node:test';
import assert from 'node:assert';
import 'reflect-metadata';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { TasksService } from '../src/tasks/tasks.service';
import { OrganizationsController } from '../src/organizations/organizations.controller';
import { Role, TaskPriority, TaskStatus, AssignmentTargetType } from '@wms/shared';

test('WMS Backend API Integration Suite', async (t) => {
  const prisma = new PrismaService();
  await prisma.onModuleInit();

  const jwtService = new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '1h' } });
  const authService = new AuthService(prisma, jwtService);
  const tasksService = new TasksService(prisma);
  const orgController = new OrganizationsController(prisma);

  await t.test('Auth: logs in successfully with valid admin credentials', async () => {
    const res = await authService.login({
      email: 'admin@wms.local',
      password: 'Password123!',
    });

    assert.ok(res.accessToken);
    assert.strictEqual(res.user.email, 'admin@wms.local');
    assert.strictEqual(res.user.role, Role.SUPER_ADMIN);
    assert.strictEqual((res.user as any).passwordHash, undefined, 'passwordHash must never be exposed');
  });

  await t.test('Auth: rejects login with invalid password', async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          email: 'admin@wms.local',
          password: 'WrongPassword!',
        });
      },
      { message: 'Invalid credentials' },
    );
  });

  await t.test('Organizations: returns active facilities and sanitized users', async () => {
    const facRes = await orgController.getFacilities();
    assert.ok(facRes.facilities.length > 0);
    assert.strictEqual(facRes.facilities[0].code, 'CAMPUS-01');

    const usrRes = await orgController.getUsers();
    assert.ok(usrRes.users.length > 0);
    for (const u of usrRes.users) {
      assert.strictEqual((u as any).passwordHash, undefined, 'User DTO must not contain passwordHash');
    }
  });

  await t.test('Tasks: creates new task with facility and user assignment', async () => {
    const adminUser = await authService.validateUser('usr-admin-01');

    const created = await tasksService.create(
      {
        title: 'Conduct Monthly Academic Review',
        description: 'Review teacher feedback forms and course delivery metrics',
        facilityId: 'fac-001',
        priority: TaskPriority.HIGH,
        assignmentTargetType: AssignmentTargetType.USER,
        assigneeUserId: 'usr-staff-01',
      },
      adminUser,
    );

    assert.ok(created.id);
    assert.strictEqual(created.title, 'Conduct Monthly Academic Review');
    assert.strictEqual(created.status, TaskStatus.ASSIGNED);
    assert.strictEqual(created.facilityId, 'fac-001');
    assert.strictEqual(created.assigneeUserId, 'usr-staff-01');
    assert.strictEqual(created.creatorId, 'usr-admin-01');
  });

  await t.test('Tasks: updates task details and changes status to BLOCKED and CANCELLED', async () => {
    const adminUser = await authService.validateUser('usr-admin-01');

    const updated = await tasksService.update(
      'task-demo-01',
      {
        title: 'Updated Task Title',
        priority: TaskPriority.URGENT,
      },
      adminUser,
    );
    assert.strictEqual(updated.title, 'Updated Task Title');
    assert.strictEqual(updated.priority, TaskPriority.URGENT);

    const blocked = await tasksService.updateStatus(
      'task-demo-01',
      { status: TaskStatus.BLOCKED },
      adminUser,
    );
    assert.strictEqual(blocked.status, TaskStatus.BLOCKED);

    const cancelled = await tasksService.updateStatus(
      'task-demo-01',
      { status: TaskStatus.CANCELLED },
      adminUser,
    );
    assert.strictEqual(cancelled.status, TaskStatus.CANCELLED);
  });

  await t.test('Tasks: updates task status to COMPLETED and records completion audit', async () => {
    const adminUser = await authService.validateUser('usr-admin-01');

    const updated = await tasksService.updateStatus(
      'task-demo-01',
      { status: TaskStatus.COMPLETED },
      adminUser,
    );

    assert.strictEqual(updated.status, TaskStatus.COMPLETED);
    assert.ok(updated.completedAt);
    assert.strictEqual(updated.completedById, adminUser.id);
  });

  await t.test('Tasks: removes task when deleted by authorized admin', async () => {
    const adminUser = await authService.validateUser('usr-admin-01');
    const created = await tasksService.create(
      {
        title: 'Task To Delete',
        facilityId: 'fac-001',
      },
      adminUser,
    );

    const delRes = await tasksService.remove(created.id, adminUser);
    assert.strictEqual(delRes.success, true);

    await assert.rejects(async () => {
      await tasksService.findOne(created.id, adminUser);
    }, { message: `Task with ID ${created.id} not found` });
  });

  await t.test('Tasks: enforces role-based task scoping for teachers', async () => {
    const staffUser = await authService.validateUser('usr-staff-01');

    const result = await tasksService.findAll({}, staffUser);
    assert.ok(result.tasks.length > 0);
    for (const task of result.tasks) {
      const isAllowed =
        task.creatorId === staffUser.id ||
        task.assigneeUserId === staffUser.id ||
        task.facilityId === staffUser.facilityId;
      assert.ok(isAllowed, `Task ${task.id} should be visible according to hierarchy scoping`);
    }
  });

  await prisma.onModuleDestroy();
});
