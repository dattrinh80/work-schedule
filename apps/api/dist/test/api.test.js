"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
require("reflect-metadata");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../src/prisma/prisma.service");
const auth_service_1 = require("../src/auth/auth.service");
const tasks_service_1 = require("../src/tasks/tasks.service");
const shared_1 = require("@wms/shared");
(0, node_test_1.default)('WMS Backend API Integration Suite', async (t) => {
    const prisma = new prisma_service_1.PrismaService();
    await prisma.onModuleInit();
    const jwtService = new jwt_1.JwtService({ secret: 'test-secret', signOptions: { expiresIn: '1h' } });
    const authService = new auth_service_1.AuthService(prisma, jwtService);
    const tasksService = new tasks_service_1.TasksService(prisma);
    await t.test('Auth: logs in successfully with valid admin credentials', async () => {
        const res = await authService.login({
            email: 'admin@wms.local',
            password: 'Password123!',
        });
        node_assert_1.default.ok(res.accessToken);
        node_assert_1.default.strictEqual(res.user.email, 'admin@wms.local');
        node_assert_1.default.strictEqual(res.user.role, shared_1.Role.SUPER_ADMIN);
        node_assert_1.default.strictEqual(res.user.passwordHash, undefined, 'passwordHash must never be exposed');
    });
    await t.test('Auth: rejects login with invalid password', async () => {
        await node_assert_1.default.rejects(async () => {
            await authService.login({
                email: 'admin@wms.local',
                password: 'WrongPassword!',
            });
        }, { message: 'Invalid credentials' });
    });
    await t.test('Tasks: creates new task with facility and user assignment', async () => {
        const adminUser = await authService.validateUser('usr-admin-01');
        const created = await tasksService.create({
            title: 'Conduct Monthly Academic Review',
            description: 'Review teacher feedback forms and course delivery metrics',
            facilityId: 'fac-001',
            priority: shared_1.TaskPriority.HIGH,
            assignmentTargetType: shared_1.AssignmentTargetType.USER,
            assigneeUserId: 'usr-staff-01',
        }, adminUser);
        node_assert_1.default.ok(created.id);
        node_assert_1.default.strictEqual(created.title, 'Conduct Monthly Academic Review');
        node_assert_1.default.strictEqual(created.status, shared_1.TaskStatus.ASSIGNED);
        node_assert_1.default.strictEqual(created.facilityId, 'fac-001');
        node_assert_1.default.strictEqual(created.assigneeUserId, 'usr-staff-01');
        node_assert_1.default.strictEqual(created.creatorId, 'usr-admin-01');
    });
    await t.test('Tasks: updates task status to COMPLETED and records completion audit', async () => {
        const adminUser = await authService.validateUser('usr-admin-01');
        const updated = await tasksService.updateStatus('task-demo-01', { status: shared_1.TaskStatus.COMPLETED }, adminUser);
        node_assert_1.default.strictEqual(updated.status, shared_1.TaskStatus.COMPLETED);
        node_assert_1.default.ok(updated.completedAt);
        node_assert_1.default.strictEqual(updated.completedById, adminUser.id);
    });
    await t.test('Tasks: enforces role-based task scoping for teachers', async () => {
        const staffUser = await authService.validateUser('usr-staff-01');
        const result = await tasksService.findAll({}, staffUser);
        node_assert_1.default.ok(result.tasks.length > 0);
        for (const task of result.tasks) {
            const isAllowed = task.creatorId === staffUser.id ||
                task.assigneeUserId === staffUser.id ||
                task.facilityId === staffUser.facilityId;
            node_assert_1.default.ok(isAllowed, `Task ${task.id} should be visible according to hierarchy scoping`);
        }
    });
    await prisma.onModuleDestroy();
});
//# sourceMappingURL=api.test.js.map