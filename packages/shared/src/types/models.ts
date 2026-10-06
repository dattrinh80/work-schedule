import { Role, TaskStatus, TaskPriority, AssignmentTargetType } from './enums.js';

export interface Facility {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  facilityId: string;
  name: string;
  code: string;
  managerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  departmentId: string;
  name: string;
  leaderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  facilityId?: string | null;
  departmentId?: string | null;
  teamId?: string | null;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string | null;
  dueDate?: string | null;
  facilityId: string;
  departmentId?: string | null;
  teamId?: string | null;
  creatorId: string;
  assignmentTargetType: AssignmentTargetType;
  assigneeUserId?: string | null;
  assigneeTeamId?: string | null;
  assigneeDepartmentId?: string | null;
  completedAt?: string | null;
  completedById?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: Partial<User> | null;
  assigneeUser?: Partial<User> | null;
  facility?: Partial<Facility> | null;
}
