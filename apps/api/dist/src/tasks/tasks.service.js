"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_1 = require("@wms/shared");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, currentUser) {
        const facility = this.prisma.store.facilities.get(dto.facilityId);
        if (!facility) {
            throw new common_1.BadRequestException(`Facility with ID ${dto.facilityId} does not exist`);
        }
        let assigneeUser = null;
        if (dto.assigneeUserId) {
            const foundUser = this.prisma.store.users.get(dto.assigneeUserId);
            if (!foundUser) {
                throw new common_1.BadRequestException(`Assignee user with ID ${dto.assigneeUserId} does not exist`);
            }
            assigneeUser = { id: foundUser.id, fullName: foundUser.fullName, email: foundUser.email };
        }
        const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        const task = {
            id,
            title: dto.title,
            description: dto.description || null,
            status: dto.assigneeUserId ? shared_1.TaskStatus.ASSIGNED : shared_1.TaskStatus.NEW,
            priority: dto.priority || shared_1.TaskPriority.MEDIUM,
            startDate: dto.startDate || null,
            dueDate: dto.dueDate || null,
            facilityId: dto.facilityId,
            departmentId: dto.departmentId || null,
            teamId: dto.teamId || null,
            creatorId: currentUser.id,
            assignmentTargetType: dto.assignmentTargetType || shared_1.AssignmentTargetType.USER,
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
    async findAll(filter, currentUser) {
        let tasks = Array.from(this.prisma.store.tasks.values());
        if (currentUser.role === shared_1.Role.TEACHER || currentUser.role === shared_1.Role.STAFF) {
            tasks = tasks.filter((t) => t.creatorId === currentUser.id ||
                t.assigneeUserId === currentUser.id ||
                (t.facilityId === currentUser.facilityId && !t.assigneeUserId));
        }
        else if (currentUser.role === shared_1.Role.FACILITY_MANAGER &&
            currentUser.facilityId) {
            tasks = tasks.filter((t) => t.facilityId === currentUser.facilityId);
        }
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
    async findOne(id, _currentUser) {
        const task = this.prisma.store.tasks.get(id);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async update(id, dto, _currentUser) {
        const task = this.prisma.store.tasks.get(id);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        if (dto.title !== undefined)
            task.title = dto.title;
        if (dto.description !== undefined)
            task.description = dto.description;
        if (dto.priority !== undefined)
            task.priority = dto.priority;
        if (dto.startDate !== undefined)
            task.startDate = dto.startDate;
        if (dto.dueDate !== undefined)
            task.dueDate = dto.dueDate;
        if (dto.assigneeUserId !== undefined) {
            if (dto.assigneeUserId) {
                const foundUser = this.prisma.store.users.get(dto.assigneeUserId);
                if (!foundUser) {
                    throw new common_1.BadRequestException(`Assignee user with ID ${dto.assigneeUserId} does not exist`);
                }
                task.assigneeUserId = dto.assigneeUserId;
                task.assigneeUser = { id: foundUser.id, fullName: foundUser.fullName, email: foundUser.email };
                if (task.status === shared_1.TaskStatus.NEW) {
                    task.status = shared_1.TaskStatus.ASSIGNED;
                }
            }
            else {
                task.assigneeUserId = null;
                task.assigneeUser = null;
            }
        }
        task.updatedAt = new Date().toISOString();
        this.prisma.store.tasks.set(id, task);
        return task;
    }
    async updateStatus(id, dto, currentUser) {
        const task = this.prisma.store.tasks.get(id);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        task.status = dto.status;
        task.updatedAt = new Date().toISOString();
        if (dto.status === shared_1.TaskStatus.COMPLETED) {
            task.completedAt = new Date().toISOString();
            task.completedById = currentUser.id;
        }
        else {
            task.completedAt = null;
            task.completedById = null;
        }
        this.prisma.store.tasks.set(id, task);
        return task;
    }
    async remove(id, currentUser) {
        const task = this.prisma.store.tasks.get(id);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        if (currentUser.role !== shared_1.Role.SUPER_ADMIN &&
            currentUser.role !== shared_1.Role.ADMIN &&
            task.creatorId !== currentUser.id) {
            throw new common_1.BadRequestException('Only administrators or the task creator can delete this task');
        }
        this.prisma.store.tasks.delete(id);
        return { success: true, id };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map