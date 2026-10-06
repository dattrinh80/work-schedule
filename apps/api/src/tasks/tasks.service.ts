import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInputDto } from './dto/create-task.dto';
import { UpdateTaskInputDto } from './dto/update-task.dto';
import { UpdateTaskStatusInputDto } from './dto/update-status.dto';
import {
  AssignmentTargetType,
  Role,
  Task,
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
}
