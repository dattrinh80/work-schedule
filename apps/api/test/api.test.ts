import test from 'node:test';
import assert from 'node:assert';
import 'reflect-metadata';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { TasksService } from '../src/tasks/tasks.service';
import { Role, TaskPriority, TaskStatus, AssignmentTargetType } from '@wms/shared';

test('WMS Backend API Integration Suite', async (t) => {
  const prisma = new PrismaService();
  await prisma.onModuleInit();

  const jwtService = new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '1h' } });
  const authService = new AuthService(prisma, jwtService);
  const tasksService = new TasksService(prisma);

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

  await t.test('Tasks: enforces role-based task scoping for teachers', async () => {
    const staffUser = await authService.validateUser('usr-staff-01');

    const result = await tasksService.findAll({}, staffUser);
    assert.ok(result.tasks.length > 0);
    // Every task visible to teacher must either be created by them, assigned to them, or in their facility
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
