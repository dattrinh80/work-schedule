import { TasksService } from './tasks.service';
import { CreateTaskInputDto } from './dto/create-task.dto';
import { UpdateTaskStatusInputDto } from './dto/update-status.dto';
import { Task, TaskListResponseDto, TaskPriority, TaskStatus, User } from '@wms/shared';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(body: CreateTaskInputDto, user: User): Promise<Task>;
    findAll(user: User, status?: TaskStatus, priority?: TaskPriority, facilityId?: string, assigneeUserId?: string): Promise<TaskListResponseDto>;
    findOne(id: string, user: User): Promise<Task>;
    updateStatus(id: string, body: UpdateTaskStatusInputDto, user: User): Promise<Task>;
}
