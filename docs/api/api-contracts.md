# WMS API Contracts Baseline

Version: 1.0.0
Date: 2026-10-06
Base Path: `/api/v1`

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
- Request:
```json
{
  "email": "admin@wms.local",
  "password": "Password123!"
}
```
- Response (200 OK):
```json
{
  "accessToken": "jwt.access.token",
  "user": {
    "id": "uuid",
    "email": "admin@wms.local",
    "fullName": "System Admin",
    "role": "SUPER_ADMIN",
    "facilityId": "uuid"
  }
}
```

### `GET /api/v1/auth/me`
- Headers: `Authorization: Bearer <token>`
- Response (200 OK):
```json
{
  "id": "uuid",
  "email": "admin@wms.local",
  "fullName": "System Admin",
  "role": "SUPER_ADMIN",
  "facilityId": "uuid"
}
```

## 2. Task Management Endpoints

### `GET /api/v1/tasks`
- Headers: `Authorization: Bearer <token>`
- Query Parameters:
  - `status` (optional): `NEW` | `ASSIGNED` | `IN_PROGRESS` | `BLOCKED` | `PENDING_REVIEW` | `COMPLETED` | `CANCELLED` | `OVERDUE`
  - `facilityId` (optional): UUID
  - `priority` (optional): `LOW` | `MEDIUM` | `HIGH` | `URGENT`
- Response (200 OK):
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Prepare IELTS Mock Exam Schedule",
      "description": "Organize room allocation and test invigilators",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "startDate": "2026-10-10T09:00:00.000Z",
      "dueDate": "2026-10-15T18:00:00.000Z",
      "facilityId": "uuid",
      "assignmentTargetType": "USER",
      "assigneeUserId": "uuid",
      "creatorId": "uuid",
      "createdAt": "2026-10-06T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

### `POST /api/v1/tasks`
- Headers: `Authorization: Bearer <token>`
- Request:
```json
{
  "title": "New Task Title",
  "description": "Task description text",
  "priority": "HIGH",
  "startDate": "2026-10-10T09:00:00.000Z",
  "dueDate": "2026-10-15T18:00:00.000Z",
  "facilityId": "uuid",
  "assignmentTargetType": "USER",
  "assigneeUserId": "uuid"
}
```
- Response (201 Created):
```json
{
  "id": "uuid",
  "title": "New Task Title",
  "description": "Task description text",
  "status": "ASSIGNED",
  "priority": "HIGH",
  "facilityId": "uuid",
  "creatorId": "uuid",
  "createdAt": "2026-10-06T12:00:00.000Z"
}
```

### `PATCH /api/v1/tasks/:id/status`
- Headers: `Authorization: Bearer <token>`
- Request:
```json
{
  "status": "COMPLETED"
}
```
- Response (200 OK):
```json
{
  "id": "uuid",
  "status": "COMPLETED",
  "completedAt": "2026-10-06T12:30:00.000Z",
  "completedById": "uuid"
}
```
