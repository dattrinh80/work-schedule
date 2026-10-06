import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role, TaskStatus, TaskPriority, AssignmentTargetType, User, Facility, Task } from '@wms/shared';

export interface DatabaseStore {
  facilities: Map<string, Facility>;
  users: Map<string, User & { passwordHash: string }>;
  tasks: Map<string, Task>;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public store: DatabaseStore = {
    facilities: new Map(),
    users: new Map(),
    tasks: new Map(),
  };

  async onModuleInit() {
    await this.seedInitialData();
  }

  async onModuleDestroy() {
    this.store.facilities.clear();
    this.store.users.clear();
    this.store.tasks.clear();
  }

  async seedInitialData() {
    if (this.store.facilities.size > 0) return;

    const facilityId = 'fac-001';
    const mainFacility: Facility = {
      id: facilityId,
      name: 'Central Campus',
      code: 'CAMPUS-01',
      address: '123 Education Boulevard, District 1',
      managerId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.facilities.set(facilityId, mainFacility);

    const adminId = 'usr-admin-01';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const adminUser: User & { passwordHash: string } = {
      id: adminId,
      email: 'admin@wms.local',
      fullName: 'System Administrator',
      role: Role.SUPER_ADMIN,
      facilityId,
      departmentId: null,
      teamId: null,
      managerId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash,
    };
    this.store.users.set(adminId, adminUser);

    const staffId = 'usr-staff-01';
    const staffHash = await bcrypt.hash('Password123!', salt);
    const staffUser: User & { passwordHash: string } = {
      id: staffId,
      email: 'teacher.sarah@wms.local',
      fullName: 'Sarah Jenkins',
      role: Role.TEACHER,
      facilityId,
      departmentId: null,
      teamId: null,
      managerId: adminId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: staffHash,
    };
    this.store.users.set(staffId, staffUser);

    const taskId = 'task-demo-01';
    const demoTask: Task = {
      id: taskId,
      title: 'Review IELTS Academic Class Roster',
      description: 'Verify attendance prerequisites and prepare course materials.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      facilityId,
      departmentId: null,
      teamId: null,
      creatorId: adminId,
      assignmentTargetType: AssignmentTargetType.USER,
      assigneeUserId: staffId,
      assigneeTeamId: null,
      assigneeDepartmentId: null,
      completedAt: null,
      completedById: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: { id: adminUser.id, fullName: adminUser.fullName, email: adminUser.email },
      assigneeUser: { id: staffUser.id, fullName: staffUser.fullName, email: staffUser.email },
      facility: { id: mainFacility.id, name: mainFacility.name, code: mainFacility.code },
    };
    this.store.tasks.set(taskId, demoTask);
  }
}
