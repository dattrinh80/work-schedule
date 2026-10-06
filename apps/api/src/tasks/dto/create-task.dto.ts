import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssignmentTargetType, CreateTaskDto, TaskPriority } from '@wms/shared';

export class CreateTaskInputDto implements CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsNotEmpty()
  facilityId!: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsEnum(AssignmentTargetType)
  @IsOptional()
  assignmentTargetType?: AssignmentTargetType;

  @IsString()
  @IsOptional()
  assigneeUserId?: string;

  @IsString()
  @IsOptional()
  assigneeTeamId?: string;

  @IsString()
  @IsOptional()
  assigneeDepartmentId?: string;
}
