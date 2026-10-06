# WMS Architecture Baseline

Version: 1.0.0
Date: 2026-10-06
Status: APPROVED

## 1. System Overview
The Work Management System (WMS) is an enterprise task assignment and tracking platform designed for multi-branch English education organizations.

```
+-------------------------------------------------------------------+
|                        Client Applications                        |
|                                                                   |
|   Next.js 14 Web Application (apps/web)                           |
|   - Auth pages (Login)                                            |
|   - Dashboard & Task Views (Kanban/List/Filters)                  |
|   - Facility / Department context                                 |
+----------------------------------+--------------------------------+
                                   | HTTPS / JSON (REST API)
                                   v
+-------------------------------------------------------------------+
|                         NestJS API (apps/api)                     |
|                                                                   |
|   [Global Guards & Interceptors]                                  |
|     - JwtAuthGuard                                                |
|     - RolesGuard (Hierarchical RBAC)                              |
|     - ValidationPipe (class-validator)                            |
|     - TransformInterceptor & HttpExceptionFilter                  |
|                                                                   |
|   [Domain Modules]                                                |
|     - AuthModule (JWT, Argon2/Bcrypt)                             |
|     - UsersModule (User profiles, roles)                          |
|     - OrganizationsModule (Facilities, Departments, Teams)        |
|     - TasksModule (Task lifecycle, assignments, subtasks)         |
|     - AuditModule (Activity logging)                              |
+----------------------------------+--------------------------------+
                                   | Prisma Client ORM
                                   v
+-------------------------------------------------------------------+
|                     PostgreSQL Database Engine                    |
|                                                                   |
|   - users, facilities, departments, teams                         |
|   - tasks, subtasks, task_comments, task_attachments             |
|   - audit_logs, notifications                                     |
+-------------------------------------------------------------------+
```

## 2. Monorepo Organization
- `apps/api`: NestJS backend service. Exposes `/api/v1/*` endpoints.
- `apps/web`: Next.js web application.
- `packages/shared`: Shared contracts, interfaces, and enums.

## 3. Communication and Data Flow
1. Client sends request with Bearer JWT token in `Authorization` header.
2. NestJS `JwtAuthGuard` validates the token and attaches `req.user` (including `userId`, `role`, `facilityId`, `departmentId`).
3. `RolesGuard` checks endpoint permissions against the authenticated role.
4. Controller invokes service methods inside Prisma transactions when mutation requires atomicity.
5. Service returns typed DTO response matching shared contracts in `packages/shared`.

## 4. Error Handling and Resilience
- Standardized API response format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```
- Error format:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["title should not be empty"],
  "timestamp": "2026-10-06T12:00:00.000Z"
}
```
