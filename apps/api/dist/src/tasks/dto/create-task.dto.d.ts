import { AssignmentTargetType, CreateTaskDto, TaskPriority } from '@wms/shared';
export declare class CreateTaskInputDto implements CreateTaskDto {
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
