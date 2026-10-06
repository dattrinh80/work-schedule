import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskPriority, UpdateTaskDto } from '@wms/shared';

export class UpdateTaskInputDto implements UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

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
  @IsOptional()
  assigneeUserId?: string;
}
