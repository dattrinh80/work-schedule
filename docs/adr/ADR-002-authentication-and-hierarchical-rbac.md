# ADR-002: Authentication and Hierarchical RBAC Architecture

- Status: ACCEPTED
- Date: 2026-10-06
- Deciders: User, Harness Bootstrap

## Context
WMS requires strict security boundaries across a multi-tier hierarchy:
- Facilities (branches)
- Departments (Sales, Academic, HR, etc.)
- Teams
- Users

Roles:
- `SUPER_ADMIN`
- `ADMIN`
- `FACILITY_MANAGER`
- `DEPARTMENT_MANAGER`
- `TEAM_LEADER`
- `STAFF`
- `TEACHER`

Data access must be scoped to prevent unauthorized access across branches or unauthorized departmental exposure.

## Decision
1. **Authentication Mechanism**:
   - JWT-based authentication with Short-lived Access Tokens (e.g. 15m) and Refresh Tokens (7d).
   - Passwords hashed using Argon2id or Bcrypt with minimum cost factor 12.
   - Standard endpoints: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/refresh`.

2. **Hierarchical Authorization Scope**:
   - Every request is authenticated by `JwtAuthGuard`.
   - `RolesGuard` and organizational scoping interceptors evaluate the user's role and branch/dept attachment:
     - `SUPER_ADMIN` / `ADMIN`: Global scope across all facilities, departments, and tasks.
     - `FACILITY_MANAGER`: Scoped strictly to resources belonging to their assigned facility.
     - `DEPARTMENT_MANAGER`: Scoped strictly to resources belonging to their facility + department.
     - `TEAM_LEADER`: Scoped strictly to their team and team members.
     - `STAFF` / `TEACHER`: Scoped to tasks where they are the creator or assignee, plus team-level public view.
3. **Audit Logging**:
   - All state transitions, role assignments, and deletions generate an immutable audit log entry.

## Alternatives Considered
- *Third-party Auth (Auth0 / Supabase)*: Introduces external vendor lock-in and complicating local on-premise deployments or custom org unit synchronization.
- *Session cookies with Redis*: Requires external Redis infrastructure from day 1 for horizontal scaling, whereas JWT tokens provide stateless microservices readiness.

## Consequences
- Clean NestJS Guard and Decorator patterns (`@Roles(...)`, `@CurrentUser()`, `@OrgScope()`).
- High security and multi-facility tenant isolation enforced at the service layer.
