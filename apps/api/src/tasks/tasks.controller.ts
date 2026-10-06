import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTaskInputDto } from './dto/create-task.dto';
import { UpdateTaskStatusInputDto } from './dto/update-status.dto';
import {
  Role,
  Task,
  TaskFilterDto,
  TaskListResponseDto,
  TaskPriority,
  TaskStatus,
  User,
} from '@wms/shared';

@Controller('api/v1/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() body: CreateTaskInputDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.create(body, user);
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('facilityId') facilityId?: string,
    @Query('assigneeUserId') assigneeUserId?: string,
  ): Promise<TaskListResponseDto> {
    const filter: TaskFilterDto = {
      status,
      priority,
      facilityId,
      assigneeUserId,
    };
    return this.tasksService.findAll(filter, user);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateTaskStatusInputDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, body, user);
  }
}
