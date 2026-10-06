import test from 'node:test';
import assert from 'node:assert';
import { Role, TaskStatus, TaskPriority, AssignmentTargetType } from '../dist/index.js';

test('shared package exports correct enums and models', () => {
  assert.strictEqual(Role.SUPER_ADMIN, 'SUPER_ADMIN');
  assert.strictEqual(Role.TEACHER, 'TEACHER');
  assert.strictEqual(TaskStatus.NEW, 'NEW');
  assert.strictEqual(TaskStatus.COMPLETED, 'COMPLETED');
  assert.strictEqual(TaskPriority.HIGH, 'HIGH');
  assert.strictEqual(AssignmentTargetType.USER, 'USER');
});
