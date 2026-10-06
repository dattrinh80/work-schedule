# Multi-Agent Coordination

## Default parallel fan-out

After Contract Gate:

- Frontend Worker
- Backend Worker
- Test Worker

Optional:
- Migration Worker
- UX/UI Worker

## Coordination rules

1. Contracts are immutable during a worker run.
2. Contract changes require Contract Change Request.
3. Shared paths require explicit ownership.
4. Overlapping write leases are prohibited by default.
5. Integration occurs only after required branches are DONE.
6. Worker completion requires worker-level evidence.
7. Failed branches route through bounded repair before join.
