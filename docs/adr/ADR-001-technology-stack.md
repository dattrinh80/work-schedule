# ADR-001: Technology Stack and Repository Structure

- Status: ACCEPTED
- Date: 2026-10-06
- Deciders: User, Harness Bootstrap

## Context
The Work Management System (WMS) is a multi-facility enterprise application serving English training centers with hierarchical organization structures (Facilities, Departments, Teams, Users), role-based access control, task lifecycle management, dashboards, and audit logs. The system must support thousands of users, ensure data integrity, and allow fast, type-safe development across frontend and backend.

## Decision
We adopt a TypeScript monorepo managed with `pnpm` workspaces:
1. **Backend (`apps/api`)**:
   - NestJS (TypeScript) with Fastify/Express platform.
   - Modular architecture (`AuthModule`, `UsersModule`, `OrganizationsModule`, `TasksModule`, `AuditModule`).
   - DTO validation using `class-validator` and `class-transformer`.
   - OpenAPI / Swagger contract generation.
2. **Frontend (`apps/web`)**:
   - Next.js 14+ (React, TypeScript) with Tailwind CSS.
   - Component architecture with accessible design primitives.
   - Client state management and API communication via typed fetchers / TanStack Query.
3. **Shared Contracts (`packages/shared`)**:
   - Shared TypeScript types, enums (`Role`, `TaskStatus`, `TaskPriority`, `AssignmentTargetType`), and API DTO contracts.
4. **Database & ORM**:
   - PostgreSQL as relational datastore ensuring ACID compliance, constraints, and relational joins.
   - Prisma ORM for schema-first modeling, automated migrations, and type-safe query generation.
5. **Tooling & Package Manager**:
   - `pnpm` as the package manager with workspace protocol (`workspace:*`).

## Alternatives Considered
- *Separate Repositories*: Higher operational friction for shared types and contracts; synchronization delays between API and UI.
- *Unified Next.js Fullstack (Server Actions only)*: Lacks strong enterprise modular boundaries (guards, interceptors, dependency injection) needed for complex multi-tier RBAC and background processing.

## Consequences
- Single source of truth for contracts across client and server.
- Deterministic builds, typechecks, and tests executed via standard pnpm scripts.
- Strong boundaries enforced at compile-time and runtime.
