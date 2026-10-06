import { TaskPriority, TaskStatus, AssignmentTargetType } from '../types/enums.js';
import { Task } from '../types/models.js';
export interface CreateTaskDto {
    title: string;
    description?: string;
    priority?: TaskPriority;
    startDate?: string;
    dueDate?: string;
    facilityId: string;
    departmentId?: string;
    teamId?: string;
    assignmentTargetType?: AssignmentTargetType;
    assigneeUserId?: string;
    assigneeTeamId?: string;
    assigneeDepartmentId?: string;
}
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    startDate?: string;
    dueDate?: string;
    assigneeUserId?: string;
}
export interface UpdateTaskStatusDto {
    status: TaskStatus;
}
export interface TaskFilterDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    facilityId?: string;
    assigneeUserId?: string;
}
export interface TaskListResponseDto {
    tasks: Task[];
    total: number;
}
//# sourceMappingURL=task.contract.d.ts.map