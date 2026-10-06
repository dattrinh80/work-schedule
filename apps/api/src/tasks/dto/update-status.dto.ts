import { IsEnum } from 'class-validator';
import { TaskStatus, UpdateTaskStatusDto } from '@wms/shared';

export class UpdateTaskStatusInputDto implements UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
