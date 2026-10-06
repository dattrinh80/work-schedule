# Spec: Full-Stack Live Integration & Comprehensive Task Lifecycle

- Date: 2026-10-06
- Status: APPROVED
- Author: Antigravity Assistant & User
- Task: FEAT-001

## 1. Overview
This specification details the end-to-end completion of the Core Task Management module for the Work Management System (WMS). It connects the Next.js frontend directly to the NestJS backend API with live JWT authentication, dynamic metadata loading, full task lifecycle transitions, task deletion/cancellation, and detailed task inspection.

## 2. Architecture & Data Flow
1. **Authentication & Session**:
   - Web application stores JWT in `localStorage`.
   - `apiClient` automatically attaches `Authorization: Bearer <token>` to all HTTP requests.
   - Provides account switcher / login dialog to switch between `admin@wms.local` (Super Admin) and `teacher.sarah@wms.local` (Teacher) for testing role-based data views.
2. **Dynamic Metadata**:
   - `GET /api/v1/facilities`: Retrieves list of active facilities.
   - `GET /api/v1/users`: Retrieves active staff and managers for task assignment.
3. **Task Mutations**:
   - `POST /api/v1/tasks`: Creates a task with title, description, priority, dates, facilityId, and assigneeUserId.
   - `PATCH /api/v1/tasks/:id`: Updates task details.
   - `PATCH /api/v1/tasks/:id/status`: Updates lifecycle status (`NEW`, `ASSIGNED`, `IN_PROGRESS`, `BLOCKED`, `PENDING_REVIEW`, `COMPLETED`, `CANCELLED`).
   - `DELETE /api/v1/tasks/:id`: Deletes a task with role checks.
4. **UI Components**:
   - `TaskDetailModal`: Full inspection modal displaying task information, timestamps, and audit info.
   - `CreateTaskModal`: Populated dynamically from API facilities and users.
   - `TaskList`: With real-time status transitions and delete action.

## 3. Interfaces & Contracts
- `UpdateTaskDto`: Partial update for task properties.
- `Facility`: Id, name, code, address, isActive.
- `User`: Id, email, fullName, role, facilityId.

## 4. Verification & Testing
- Backend unit and integration tests covering all new endpoints.
- UI token and component tests.
- Harness gates: G1 (Requirement), G2 (Architecture), G4 (Contract), G5 (Quality), G7 (Security), G8 (UI), G9 (Release).
