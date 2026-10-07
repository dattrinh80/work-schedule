import {
  Body,
  Controller,
  Delete,
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
import { UpdateTaskInputDto } from './dto/update-task.dto';
import { UpdateTaskStatusInputDto } from './dto/update-status.dto';
import {
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTaskInputDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.update(id, body, user);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateTaskStatusInputDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, body, user);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; id: string }> {
    return this.tasksService.remove(id, user);
  }

  // --- Subtask Endpoints ---

  @Get(':id/subtasks')
  async getSubtasks(
    @Param('id') taskId: string,
    @CurrentUser() user: User,
  ) {
    const subtasks = await this.tasksService.findSubtasks(taskId, user);
    return { subtasks, total: subtasks.length };
  }

  @Post(':id/subtasks')
  async createSubtask(
    @Param('id') taskId: string,
    @Body() body: { title: string; assigneeUserId?: string },
    @CurrentUser() user: User,
  ) {
    return this.tasksService.createSubtask(taskId, body, user);
  }

  @Patch(':id/subtasks/:subtaskId')
  async toggleSubtask(
    @Param('id') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Body() body: { isCompleted: boolean },
    @CurrentUser() user: User,
  ) {
    return this.tasksService.toggleSubtask(taskId, subtaskId, body.isCompleted, user);
  }

  @Delete(':id/subtasks/:subtaskId')
  async deleteSubtask(
    @Param('id') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.removeSubtask(taskId, subtaskId, user);
  }

  // --- Comment Endpoints ---

  @Get(':id/comments')
  async getComments(
    @Param('id') taskId: string,
    @CurrentUser() user: User,
  ) {
    const comments = await this.tasksService.findComments(taskId, user);
    return { comments, total: comments.length };
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') taskId: string,
    @Body() body: { content: string },
    @CurrentUser() user: User,
  ) {
    return this.tasksService.addComment(taskId, body.content, user);
  }
}
