# Full-Stack Live Integration & Comprehensive Task Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Next.js frontend to the NestJS backend API with live JWT authentication, add metadata endpoints (`GET facilities`, `GET users`), enable full task lifecycle transitions (`NEW`, `ASSIGNED`, `IN_PROGRESS`, `BLOCKED`, `PENDING_REVIEW`, `COMPLETED`, `CANCELLED`), task deletion, and detailed task inspection.

**Architecture:** Extend backend controllers with metadata and full lifecycle endpoints, add shared `UpdateTaskDto`, build frontend typed `apiClient` with token persistence, and update the UI with real-time API state, task detail modal, and quick status actions.

**Tech Stack:** NestJS, TypeScript, Next.js / React, Tailwind CSS, pnpm monorepo.

## Global Constraints
- All public contract changes must be reflected in `packages/shared`.
- All deterministic verifications (`pnpm run build`, `lint`, `typecheck`, `test`, `contract_test`, `architecture_test`, `ui_test`) must pass.
- Zero secrets committed.

---

### Task 1: Extend Shared Contracts and Backend Endpoints
**Files:**
- Modify: `packages/shared/src/contracts/task.contract.ts`
- Modify: `apps/api/src/tasks/tasks.service.ts`
- Modify: `apps/api/src/tasks/tasks.controller.ts`
- Create: `apps/api/src/organizations/organizations.controller.ts`
- Modify: `apps/api/src/app.module.ts`
- Test: `apps/api/test/api.test.ts`

- [ ] **Step 1: Write failing integration test for new endpoints in `apps/api/test/api.test.ts`**
- [ ] **Step 2: Add `UpdateTaskDto` to `packages/shared/src/contracts/task.contract.ts` and rebuild shared**
- [ ] **Step 3: Implement `OrganizationsController` for `GET /api/v1/facilities` and `GET /api/v1/users`**
- [ ] **Step 4: Implement `update` and `remove` methods in `TasksService` and `TasksController`**
- [ ] **Step 5: Verify tests pass (`pnpm --filter @wms/api run test`)**
- [ ] **Step 6: Commit Task 1**

---

### Task 2: Build Live Frontend API Client and Session State
**Files:**
- Create: `apps/web/src/lib/api.ts`
- Test: `apps/web/test/ui.test.ts`

- [ ] **Step 1: Implement typed `apiClient` supporting login, getMe, getFacilities, getUsers, getTasks, createTask, updateTaskStatus, deleteTask**
- [ ] **Step 2: Add tests in `apps/web/test/ui.test.ts` verifying API client contract structure**
- [ ] **Step 3: Verify tests pass (`pnpm --filter @wms/web run test`)**
- [ ] **Step 4: Commit Task 2**

---

### Task 3: Implement Task Detail Modal and Full Lifecycle UI
**Files:**
- Create: `apps/web/src/components/task-detail-modal.tsx`
- Modify: `apps/web/src/components/task-list.tsx`
- Modify: `apps/web/src/components/create-task-modal.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `scripts/contract-check.mjs`

- [ ] **Step 1: Create `TaskDetailModal` displaying task details, audit dates, status changer, and delete action**
- [ ] **Step 2: Update `TaskList` with clickable titles to view details, and direct status selector**
- [ ] **Step 3: Update `CreateTaskModal` to dynamically accept facilities and users from props**
- [ ] **Step 4: Connect `apps/web/src/app/page.tsx` with live data loading, demo account switcher, and error handling**
- [ ] **Step 5: Update `scripts/contract-check.mjs` to validate new routes**
- [ ] **Step 6: Commit Task 3**

---

### Task 4: Harness Gates Verification and Evidence Packaging
**Files:**
- Update: `.ai/runtime/tasks/FEAT-001/evidence.yaml`
- Update: `.ai/runtime/tasks/FEAT-001/state.yaml`

- [ ] **Step 1: Run full deterministic verification (`harness verify FEAT-001`)**
- [ ] **Step 2: Run all gates (`G1_REQUIREMENT`, `G2_ARCHITECTURE`, `G4_CONTRACT`, `G5_QUALITY`, `G7_SECURITY`, `G8_UI`, `G9_RELEASE`)**
- [ ] **Step 3: Generate evidence manifest and update state.yaml**
- [ ] **Step 4: Commit Task 4**
