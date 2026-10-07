import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInputDto } from './dto/create-task.dto';
import { UpdateTaskInputDto } from './dto/update-task.dto';
import { UpdateTaskStatusInputDto } from './dto/update-status.dto';
import {
  AssignmentTargetType,
  Role,
  Subtask,
  Task,
  TaskComment,
  TaskFilterDto,
  TaskListResponseDto,
  TaskPriority,
  TaskStatus,
  User,
} from '@wms/shared';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskInputDto, currentUser: User): Promise<Task> {
    const facility = this.prisma.store.facilities.get(dto.facilityId);
    if (!facility) {
      throw new BadRequestException(`Facility with ID ${dto.facilityId} does not exist`);
    }

    let assigneeUser = null;
    if (dto.assigneeUserId) {
      const foundUser = this.prisma.store.users.get(dto.assigneeUserId);
      if (!foundUser) {
        throw new BadRequestException(`Assignee user with ID ${dto.assigneeUserId} does not exist`);
      }
      assigneeUser = { id: foundUser.id, fullName: foundUser.fullName, email: foundUser.email };
    }

    const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const task: Task = {
      id,
      title: dto.title,
      description: dto.description || null,
      status: dto.assigneeUserId ? TaskStatus.ASSIGNED : TaskStatus.NEW,
      priority: dto.priority || TaskPriority.MEDIUM,
      startDate: dto.startDate || null,
      dueDate: dto.dueDate || null,
      facilityId: dto.facilityId,
      departmentId: dto.departmentId || null,
      teamId: dto.teamId || null,
      creatorId: currentUser.id,
      assignmentTargetType: dto.assignmentTargetType || AssignmentTargetType.USER,
      assigneeUserId: dto.assigneeUserId || null,
      assigneeTeamId: dto.assigneeTeamId || null,
      assigneeDepartmentId: dto.assigneeDepartmentId || null,
      completedAt: null,
      completedById: null,
      createdAt: now,
      updatedAt: now,
      creator: { id: currentUser.id, fullName: currentUser.fullName, email: currentUser.email },
      assigneeUser,
      facility: { id: facility.id, name: facility.name, code: facility.code },
    };

    this.prisma.store.tasks.set(id, task);
    return task;
  }

  async findAll(filter: TaskFilterDto, currentUser: User): Promise<TaskListResponseDto> {
    let tasks = Array.from(this.prisma.store.tasks.values());

    // Role-based hierarchy scoping
    if (currentUser.role === Role.TEACHER || currentUser.role === Role.STAFF) {
      tasks = tasks.filter(
        (t) =>
          t.creatorId === currentUser.id ||
          t.assigneeUserId === currentUser.id ||
          (t.facilityId === currentUser.facilityId && !t.assigneeUserId),
      );
    } else if (
      currentUser.role === Role.FACILITY_MANAGER &&
      currentUser.facilityId
    ) {
      tasks = tasks.filter((t) => t.facilityId === currentUser.facilityId);
    }

    // Filters
    if (filter.status) {
      tasks = tasks.filter((t) => t.status === filter.status);
    }
    if (filter.priority) {
      tasks = tasks.filter((t) => t.priority === filter.priority);
    }
    if (filter.facilityId) {
      tasks = tasks.filter((t) => t.facilityId === filter.facilityId);
    }
    if (filter.assigneeUserId) {
      tasks = tasks.filter((t) => t.assigneeUserId === filter.assigneeUserId);
    }

    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      tasks,
      total: tasks.length,
    };
  }

  async findOne(id: string, _currentUser: User): Promise<Task> {
    const task = this.prisma.store.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskInputDto, _currentUser: User): Promise<Task> {
    const task = this.prisma.store.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.startDate !== undefined) task.startDate = dto.startDate;
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate;

    if (dto.assigneeUserId !== undefined) {
      if (dto.assigneeUserId) {
        const foundUser = this.prisma.store.users.get(dto.assigneeUserId);
        if (!foundUser) {
          throw new BadRequestException(`Assignee user with ID ${dto.assigneeUserId} does not exist`);
        }
        task.assigneeUserId = dto.assigneeUserId;
        task.assigneeUser = { id: foundUser.id, fullName: foundUser.fullName, email: foundUser.email };
        if (task.status === TaskStatus.NEW) {
          task.status = TaskStatus.ASSIGNED;
        }
      } else {
        task.assigneeUserId = null;
        task.assigneeUser = null;
      }
    }

    task.updatedAt = new Date().toISOString();
    this.prisma.store.tasks.set(id, task);
    return task;
  }

  async updateStatus(id: string, dto: UpdateTaskStatusInputDto, currentUser: User): Promise<Task> {
    const task = this.prisma.store.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    task.status = dto.status;
    task.updatedAt = new Date().toISOString();

    if (dto.status === TaskStatus.COMPLETED) {
      task.completedAt = new Date().toISOString();
      task.completedById = currentUser.id;
    } else {
      task.completedAt = null;
      task.completedById = null;
    }

    this.prisma.store.tasks.set(id, task);
    return task;
  }

  async remove(id: string, currentUser: User): Promise<{ success: boolean; id: string }> {
    const task = this.prisma.store.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (
      currentUser.role !== Role.SUPER_ADMIN &&
      currentUser.role !== Role.ADMIN &&
      task.creatorId !== currentUser.id
    ) {
      throw new BadRequestException('Only administrators or the task creator can delete this task');
    }

    this.prisma.store.tasks.delete(id);
    return { success: true, id };
  }

  // --- Subtask Management (PRD Module 4) ---

  async findSubtasks(taskId: string, currentUser: User): Promise<Subtask[]> {
    await this.findOne(taskId, currentUser);
    const subtasks = Array.from(this.prisma.store.subtasks.values()).filter(
      (s) => s.taskId === taskId,
    );
    return subtasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createSubtask(
    taskId: string,
    dto: { title: string; assigneeUserId?: string },
    currentUser: User,
  ): Promise<Subtask> {
    await this.findOne(taskId, currentUser);
    if (!dto.title?.trim()) {
      throw new BadRequestException('Subtask title is required');
    }

    let assigneeUser = null;
    if (dto.assigneeUserId) {
      const u = this.prisma.store.users.get(dto.assigneeUserId);
      if (u) {
        assigneeUser = { id: u.id, fullName: u.fullName };
      }
    }

    const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const subtask: Subtask = {
      id,
      taskId,
      title: dto.title.trim(),
      isCompleted: false,
      assigneeUserId: dto.assigneeUserId || null,
      assigneeUser,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.prisma.store.subtasks.set(id, subtask);
    return subtask;
  }

  async toggleSubtask(
    taskId: string,
    subtaskId: string,
    isCompleted: boolean,
    currentUser: User,
  ): Promise<Subtask> {
    await this.findOne(taskId, currentUser);
    const subtask = this.prisma.store.subtasks.get(subtaskId);
    if (!subtask || subtask.taskId !== taskId) {
      throw new NotFoundException(`Subtask with ID ${subtaskId} not found under task ${taskId}`);
    }

    subtask.isCompleted = isCompleted;
    subtask.completedAt = isCompleted ? new Date().toISOString() : null;
    subtask.updatedAt = new Date().toISOString();
    this.prisma.store.subtasks.set(subtaskId, subtask);
    return subtask;
  }

  async removeSubtask(
    taskId: string,
    subtaskId: string,
    currentUser: User,
  ): Promise<{ success: boolean; id: string }> {
    await this.findOne(taskId, currentUser);
    const subtask = this.prisma.store.subtasks.get(subtaskId);
    if (!subtask || subtask.taskId !== taskId) {
      throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
    }

    this.prisma.store.subtasks.delete(subtaskId);
    return { success: true, id: subtaskId };
  }

  // --- Task Comments & Activity (PRD Module 5) ---

  async findComments(taskId: string, currentUser: User): Promise<TaskComment[]> {
    await this.findOne(taskId, currentUser);
    const comments = Array.from(this.prisma.store.comments.values()).filter(
      (c) => c.taskId === taskId,
    );
    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async addComment(
    taskId: string,
    content: string,
    currentUser: User,
  ): Promise<TaskComment> {
    await this.findOne(taskId, currentUser);
    if (!content?.trim()) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    const id = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const comment: TaskComment = {
      id,
      taskId,
      authorId: currentUser.id,
      content: content.trim(),
      author: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        role: currentUser.role,
      },
      createdAt: new Date().toISOString(),
    };

    this.prisma.store.comments.set(id, comment);
    return comment;
  }
}
