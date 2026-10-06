# WORK MANAGEMENT SYSTEM (WMS)
## Product Requirements Document (PRD)
Version: 3.0
Status: Ready for AI-driven System Design

---

# 1. OVERVIEW

## 1.1 System Name

Work Management System (WMS)

---

## 1.2 Purpose

The system is designed to manage, assign, track, and monitor tasks across a multi-facility English training organization.

The system ensures:

- Clear task ownership
- Task progress visibility
- Organizational coordination
- Accountability
- Performance tracking
- Workflow standardization

---

## 1.3 Target Organization Structure

The system must support:

- Multiple facilities (branches)
- Multiple departments per facility
- Multiple teams per department
- Multiple users per team

Example departments:

- Sales
- Telesales
- Academic
- Teachers
- Marketing
- Operations
- HR
- Finance
- Management

---

# 2. USER ROLES

The system must support the following roles:

- Super Admin
- Admin
- Facility Manager
- Department Manager
- Team Leader
- Staff
- Teacher

Each role has different permissions.

---

# 3. CORE MODULES

---

# MODULE 1: Organization Management

## Purpose

Manage organizational structure.

## Functional Requirements

The system must allow:

- Create facility
- Edit facility
- Delete facility
- Assign facility manager

- Create department
- Edit department
- Delete department
- Assign department manager

- Create team
- Edit team
- Delete team
- Assign team leader

---

# MODULE 2: User Management

## Purpose

Manage users and their organizational assignments.

## Functional Requirements

The system must allow:

- Create user
- Edit user
- Deactivate user
- Assign user to facility
- Assign user to department
- Assign user to team
- Assign manager to user

The system must support authentication.

The system must support role-based access control.

---

# MODULE 3: Task Management (CORE MODULE)

## Purpose

Manage all organizational tasks.

## Functional Requirements

The system must allow users to:

Create task with:

- title
- description
- priority
- start date
- due date
- assignee
- department
- team
- facility

Update task.

Delete task.

Assign task to:

- individual user
- team
- department

Change task status.

Track task progress.

Mark task completed.

Cancel task.

---

# MODULE 4: Subtask Management

## Purpose

Allow tasks to be broken down into smaller tasks.

## Functional Requirements

The system must allow:

- Create subtask under a parent task
- View subtasks
- Complete subtasks

The system must track subtask progress independently.

---

# MODULE 5: Task Comment and Communication

## Purpose

Enable communication within tasks.

## Functional Requirements

The system must allow users to:

- Comment on task
- Reply to comments
- Mention other users
- View comment history

---

# MODULE 6: File Attachment

## Purpose

Attach files to tasks.

## Functional Requirements

The system must allow users to:

- Upload files
- View files
- Delete files

Supported use cases:

- student lists
- reports
- contracts
- documents

---

# MODULE 7: Task Status Management

The system must support task lifecycle including:

- New
- Assigned
- In Progress
- Blocked
- Pending Review
- Completed
- Cancelled
- Overdue

---

# MODULE 8: Task Assignment and Responsibility Tracking

The system must track:

- who created the task
- who is assigned
- who completed the task
- when task was created
- when task was completed

---

# MODULE 9: Notification System

The system must notify users when:

- task assigned
- task updated
- task commented
- task overdue
- task completed

Notifications must be visible inside the system.

---

# MODULE 10: Dashboard

## Personal Dashboard

The system must show:

- tasks assigned to the user
- overdue tasks
- tasks due today
- completed tasks

---

## Manager Dashboard

The system must show:

- team tasks
- department tasks
- overdue tasks
- completion rate

---

## Executive Dashboard

The system must show:

- tasks by facility
- tasks by department
- completion statistics

---

# MODULE 11: Approval Management

The system must support approval workflow.

The system must allow:

- approve task completion
- reject task completion

The system must track approver and approval time.

---

# MODULE 12: Reporting

The system must allow generation of reports including:

- tasks by user
- tasks by team
- tasks by department
- tasks by facility
- overdue tasks
- completion rate

Reports must support filtering by date range.

---

# MODULE 13: Calendar View

The system must provide calendar view showing:

- tasks by due date
- tasks by start date

---

# MODULE 14: Search and Filtering

The system must allow users to search tasks by:

- title
- assignee
- department
- facility
- status

The system must allow filtering tasks.

---

# MODULE 15: Audit Log

The system must track system activity including:

- task creation
- task update
- task deletion
- assignment changes
- status changes

---

# MODULE 16: Permissions and Access Control

The system must enforce role-based permissions.

Users can only access authorized data.

Managers can view their team data.

Admins can view all data.

---

# 4. NON-FUNCTIONAL REQUIREMENTS

The system must be able to support:

- thousands of users
- large number of tasks
- concurrent users

The system must ensure:

- data integrity
- access control
- system reliability

---

# 5. SUCCESS CRITERIA

The system is successful if:

- tasks are clearly assigned
- task completion rate improves
- overdue tasks decrease
- managers can monitor operations effectively

---

# END OF PRD
