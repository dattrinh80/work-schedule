# Authentication, Session Management, and Hierarchical Scope Switching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full-featured authentication lifecycle (interactive login with validation, multi-user demo accounts, token persistence, explicit logout) and role-aware facility scope switching in Navbar, connecting the frontend to live backend authorization.

**Architecture:** Extend `@wms/shared` with `ActiveScope` and `TaskFilterQuery`, augment backend in-memory seed data with Facility Managers and Teachers across multiple branches, support `facilityId` query filtering in Tasks API, implement `LoginForm` and Navbar `ScopeSwitcher` in `@wms/web`, and connect active scope context to task querying and creation.

**Tech Stack:** NestJS, TypeScript, Next.js / React, Tailwind CSS, pnpm monorepo.

## Global Constraints
- All public contract changes must be reflected in `packages/shared`.
- All deterministic verifications (`pnpm run build`, `lint`, `typecheck`, `test`, `contract_test`, `architecture_test`, `ui_test`) must pass.
- Zero secrets committed.

---

### Task 1: Shared Contracts & Backend Seed Accounts & Query Filtering
**Files:**
- Modify: `packages/shared/src/contracts/auth.contract.ts`
- Modify: `packages/shared/src/contracts/task.contract.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `apps/api/src/prisma/prisma.service.ts`
- Modify: `apps/api/src/tasks/tasks.controller.ts`
- Modify: `apps/api/src/tasks/tasks.service.ts`
- Test: `apps/api/test/api.test.ts`

- [x] **Step 1: Add failing test in `apps/api/test/api.test.ts` for multiple seed users login and facility query filtering**
- [x] **Step 2: Add `ActiveScope` and `TaskFilterQuery` interfaces to shared contracts and rebuild shared**
- [x] **Step 3: Update `PrismaService` with seeded managers and facilities (`Central Campus`, `West Campus`)**
- [x] **Step 4: Update `TasksController` and `TasksService` to filter tasks by `facilityId` query param**
- [x] **Step 5: Run backend tests (`pnpm --filter @wms/api run test`) and verify all pass**
- [x] **Step 6: Commit Task 1**

---

### Task 2: Web API Client Session & Scope Storage
**Files:**
- Modify: `apps/web/src/lib/api.ts`
- Test: `apps/web/test/ui.test.ts`

- [x] **Step 1: Write tests in `apps/web/test/ui.test.ts` for scope storage and task filter querying**
- [x] **Step 2: Implement `scopeStorage` (`getActiveScope`, `setActiveScope`, `clearScope`) in `apps/web/src/lib/api.ts`**
- [x] **Step 3: Update `apiClient.getTasks` to accept optional `facilityId` query parameter**
- [x] **Step 4: Run web unit tests (`pnpm --filter @wms/web run test`)**
- [x] **Step 5: Commit Task 2**

---

### Task 3: Interactive Login Form Component
**Files:**
- Create: `apps/web/src/components/login-form.tsx`
- Modify: `apps/web/test/ui.test.ts`

- [x] **Step 1: Create `LoginForm` with email/password fields, submit button, loading state, error banner, and quick demo login buttons**
- [x] **Step 2: Add UI unit test verifying `LoginForm` rendering and preset demo account triggers**
- [x] **Step 3: Run web tests (`pnpm --filter @wms/web run test`)**
- [x] **Step 4: Commit Task 3**

---

### Task 4: Navbar Scope Switcher & Logout Integration
**Files:**
- Modify: `apps/web/src/components/navbar.tsx`
- Modify: `apps/web/test/ui.test.ts`

- [x] **Step 1: Update `Navbar` to render a branch/facility selector dropdown for admins, or a locked badge for facility-scoped users**
- [x] **Step 2: Wire `onScopeChange` and `onLogout` handlers in `Navbar`**
- [x] **Step 3: Update tests in `apps/web/test/ui.test.ts` for Navbar scope rendering**
- [x] **Step 4: Run web tests (`pnpm --filter @wms/web run test`)**
- [x] **Step 5: Commit Task 4**

---

### Task 5: App Integration & Scope-Aware Task Context
**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `scripts/contract-check.mjs`

- [x] **Step 1: In `apps/web/src/app/page.tsx`, show `LoginForm` when `currentUser` is null**
- [x] **Step 2: Support session hydration from stored token via `apiClient.getMe()` on initial mount**
- [x] **Step 3: Handle `onScopeChange` to re-fetch tasks filtered by active facility**
- [x] **Step 4: Pass active facility to `CreateTaskModal` to default facility selection**
- [x] **Step 5: Update `scripts/contract-check.mjs` to validate any updated endpoints**
- [x] **Step 6: Run full test suite (`pnpm test`)**
- [x] **Step 7: Commit Task 5**

---

### Task 6: Deterministic Verification & Harness Gates
**Files:**
- Create: `.ai/runtime/tasks/FEAT-002/gates/`
- Create: `.ai/runtime/tasks/FEAT-002/evidence.yaml`
- Update: `.ai/runtime/tasks/FEAT-002/state.yaml`

- [x] **Step 1: Run full verification (`pnpm run build && pnpm run lint && pnpm run typecheck && pnpm test`)**
- [x] **Step 2: Run verification scripts (`test:contract`, `test:architecture`, `test:security`)**
- [x] **Step 3: Evaluate all blocking gates G1 through G9 for FEAT-002**
- [x] **Step 4: Generate evidence manifest and update state.yaml**
- [x] **Step 5: Commit Task 6**
