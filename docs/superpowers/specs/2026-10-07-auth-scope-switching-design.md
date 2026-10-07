# Design Specification: Authentication, Session Management, and Scope Switching

**Status:** APPROVED  
**Date:** 2026-10-07  
**Task ID:** FEAT-002  
**Owner:** Core Engineering  

---

## 1. Executive Summary

This specification defines the complete end-to-end authentication, session lifecycle, and hierarchical scope switching mechanism for the Work Management System (WMS). It transitions the frontend from an automatic mock-login state into an enterprise authentication flow supporting real login, explicit logout, session hydration, and role-aware facility/department scope filtering in accordance with [PRD-Master](file:///d:/Project/work-schedule-prj/docs/product/prd-master.md) and [ADR-002](file:///d:/Project/work-schedule-prj/docs/adr/ADR-002-authentication-and-hierarchical-rbac.md).

---

## 2. Goals & Non-Goals

### 2.1 Goals
- **Interactive Login Experience:** A clean, accessible `LoginForm` with validation, loading indicators, error feedback, and quick-access demo credentials.
- **Session Lifecycle & Hydration:** Local storage token management with background token verification via `GET /api/v1/auth/me`.
- **Complete Logout:** Immediate clearance of sensitive tokens, session state reset, and redirection to the unauthenticated view.
- **Hierarchical Scope Switcher:** Navbar-integrated scope selector enabling global administrators (`SUPER_ADMIN`, `ADMIN`) to seamlessly filter context by "All Facilities" or a specific branch, while strictly locking localized roles (`FACILITY_MANAGER`, `TEACHER`, `STAFF`) to their authorized facility.
- **Backend Filter Support & Multi-User Seed Data:** Support query parameter filtering on `GET /api/v1/tasks?facilityId=...` and seed representative manager accounts for Central and West campuses.

### 2.2 Non-Goals
- Full OAuth2 / Google SSO integration (deferred to future auth provider slice).
- Biometric authentication or MFA (Multi-Factor Authentication).

---

## 3. Architecture & Data Contracts

### 3.1 Shared Contracts (`packages/shared`)
```typescript
export interface ActiveScope {
  facilityId: string | 'ALL';
  facilityName?: string;
}

export interface TaskFilterQuery {
  facilityId?: string;
  status?: TaskStatus;
  assigneeUserId?: string;
}
```

### 3.2 Backend Seed Data (`apps/api/src/prisma/prisma.service.ts`)
Add predefined demo accounts with BCrypt-hashed `Password123!`:
- `admin@wms.local` (`SUPER_ADMIN`, Global)
- `manager.central@wms.local` (`FACILITY_MANAGER`, Central Campus `fac-001`)
- `manager.west@wms.local` (`FACILITY_MANAGER`, West Campus `fac-002`)
- `teacher.sarah@wms.local` (`TEACHER`, Central Campus `fac-001`)

Ensure `GET /api/v1/tasks` in `TasksController` accepts `@Query('facilityId') facilityId?: string` and filters tasks accordingly.

### 3.3 Frontend Client & Storage (`apps/web/src/lib/api.ts`)
- `tokenStorage`: `getToken()`, `setToken(token: string)`, `clearToken()`.
- `scopeStorage`: `getActiveScope(): ActiveScope`, `setActiveScope(scope: ActiveScope)`.
- `apiClient.getTasks(filter?: TaskFilterQuery)`: passes query params to backend.

---

## 4. UI/UX Interaction Design

### 4.1 Login View (`apps/web/src/components/login-form.tsx`)
- Centered card layout on neutral backdrop with WMS branding.
- Email and password inputs with field validation.
- "Sign In" button with loading spinner.
- Error banner when credentials fail.
- Quick login pills:
  - `👑 Super Admin`
  - `🏢 Central Manager`
  - `🏢 West Manager`
  - `👩‍🏫 Teacher Sarah`

### 4.2 Navbar Scope Switcher (`apps/web/src/components/navbar.tsx`)
- When `currentUser.role` in `[SUPER_ADMIN, ADMIN]`:
  - Dropdown selector:
    - `🌐 All Facilities`
    - `🏫 Central Campus (CAMPUS-01)`
    - `🏫 West Campus (CAMPUS-02)`
- When user is bound to a single facility:
  - Display static badge with facility name and lock icon.
- User profile dropdown with "Sign out" action invoking `handleLogout()`.

### 4.3 Task Filtering by Active Scope (`apps/web/src/app/page.tsx`)
- When scope is `ALL`: displays all tasks accessible to user role.
- When scope is specific `facilityId`: fetches or filters tasks matching that facility.
- Create task modal automatically pre-populates the active facility if not set to `ALL`.

---

## 5. Security & Verification Baseline

1. **Deterministic Tests:**
   - Backend auth & filtering unit tests: `pnpm --filter @wms/api run test`.
   - Web UI login & scope switcher tests: `pnpm --filter @wms/web run test`.
   - Contract compliance: `node scripts/contract-check.mjs`.
   - Architectural isolation: `node scripts/architecture-check.mjs`.
   - Secret scan: `node scripts/security-check.mjs`.
2. **Harness v4.1 Gates:**
   - All gates G1 through G9 evaluated and passing.
