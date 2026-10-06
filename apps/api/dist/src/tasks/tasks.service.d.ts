import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInputDto } from './dto/create-task.dto';
import { UpdateTaskStatusInputDto } from './dto/update-status.dto';
import { Task, TaskFilterDto, TaskListResponseDto, User } from '@wms/shared';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTaskInputDto, currentUser: User): Promise<Task>;
    findAll(filter: TaskFilterDto, currentUser: User): Promise<TaskListResponseDto>;
    findOne(id: string, _currentUser: User): Promise<Task>;
    updateStatus(id: string, dto: UpdateTaskStatusInputDto, currentUser: User): Promise<Task>;
}
