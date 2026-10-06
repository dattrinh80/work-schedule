import test from 'node:test';
import assert from 'node:assert';
import { TaskStatus, TaskPriority } from '@wms/shared';
import { StatusBadge, PriorityBadge } from '../src/components/badge.js';
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
});
