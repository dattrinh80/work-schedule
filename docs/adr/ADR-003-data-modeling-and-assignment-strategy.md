# ADR-003: Relational Data Modeling and Flexible Task Assignment Strategy

- Status: ACCEPTED
- Date: 2026-10-06
- Deciders: User, Harness Bootstrap

## Context
PRD Module 3 specifies tasks can be assigned to:
1. An individual user (`USER`)
2. A team (`TEAM`)
3. A department (`DEPARTMENT`)

Tasks also track facility context, status lifecycle (`NEW`, `ASSIGNED`, `IN_PROGRESS`, `BLOCKED`, `PENDING_REVIEW`, `COMPLETED`, `CANCELLED`, `OVERDUE`), priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and timestamps.

## Decision
1. **Relational Integrity via Explicit Foreign Keys**:
   - Rather than untyped polymorphic IDs (`entity_type` + `entity_id` without foreign keys), we employ explicit, nullable foreign keys on the `Task` table:
     - `assignee_user_id` -> foreign key to `users.id`
     - `assignee_team_id` -> foreign key to `teams.id`
     - `assignee_department_id` -> foreign key to `departments.id`
     - `assignment_target_type` -> Enum: `USER`, `TEAM`, `DEPARTMENT`
   - Database check constraint or ORM validation ensures consistent assignment target.
2. **Organization Relations**:
   - `Facility` 1-to-many `Department`
   - `Department` 1-to-many `Team`
   - `User` belongs to `Facility`, optionally `Department`, optionally `Team`.
3. **Task Lifecycle**:
   - Defined as an enum: `NEW`, `ASSIGNED`, `IN_PROGRESS`, `BLOCKED`, `PENDING_REVIEW`, `COMPLETED`, `CANCELLED`, `OVERDUE`.
   - Creation automatically marks status as `NEW` or `ASSIGNED` if assignee target is provided.

## Alternatives Considered
- *Polymorphic UUIDs*: Breaks database-level foreign key constraints and referential cascading in PostgreSQL.
- *Single-assignee user only*: Violates PRD requirement allowing tasks to be delegated directly to entire departments or teams.

## Consequences
- Full referential integrity maintained by PostgreSQL.
- Fast indexed queries for "all tasks for user X", "all tasks for team Y", "all tasks for department Z".
