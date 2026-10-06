# Decision: Bootstrap Thin Vertical Slice Scope

- ID: DECISION-001
- Date: 2026-10-06
- Task: BOOTSTRAP-001
- Status: ACCEPTED
- Owner: Harness Bootstrap & User

## Context
Under AI Software Development Harness v4.0, bootstrap requires:
"Implement one thin vertical slice to validate FE/BE/DB/auth/test integration."
The slice must not be an empty shell or broad unimplemented scaffold, but an end-to-end working feature across all tiers with automated deterministic tests.

## Decision
We implement the **Authentication & Core Task Vertical Slice**:
1. **Database Tier**:
   - PostgreSQL schema with core tables: `facilities`, `departments`, `teams`, `users`, `tasks`.
   - Seed script creating baseline facility, admin user, and sample task.
2. **Backend API (`apps/api`)**:
   - `AuthModule`: `POST /api/v1/auth/login`, `GET /api/v1/auth/me` with JWT guard.
   - `TasksModule`: `POST /api/v1/tasks` (create task), `GET /api/v1/tasks` (list tasks with filtering), `GET /api/v1/tasks/:id`, `PATCH /api/v1/tasks/:id/status`.
   - Structured error responses, request DTO validation.
3. **Frontend Client (`apps/web`)**:
   - Authentication flow: Login page with credentials.
   - Authenticated Shell: Topbar showing current user & facility context.
   - Task Dashboard: Task list with status filters, priority badges, and modal to create new tasks.
4. **Shared Contracts (`packages/shared`)**:
   - Enums and DTO interfaces shared across FE and BE.
5. **Deterministic Verification**:
   - Package builds, typechecks, linter, and unit/integration tests running via `pnpm`.

## Alternatives Considered
- *Health check only*: Does not validate DB models, Auth guards, or rich UI interactions.
- *Full Organization Management CRUD*: Wider scope with less validation of core task lifecycles.

## Rationale
Validates the entire architectural pipeline: client form submission -> JWT auth header -> NestJS guard -> DTO validation -> Prisma database transaction -> typed response -> React state update.

## Impact
Establishes a solid blueprint for subsequent feature modules (Subtasks, Comments, Attachments, Notifications, Dashboards).
