import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role, TaskStatus, TaskPriority, AssignmentTargetType, User, Facility, Task, Subtask, TaskComment } from '@wms/shared';

export interface DatabaseStore {
  facilities: Map<string, Facility>;
  users: Map<string, User & { passwordHash: string }>;
  tasks: Map<string, Task>;
  subtasks: Map<string, Subtask>;
  comments: Map<string, TaskComment>;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public store: DatabaseStore = {
    facilities: new Map(),
    users: new Map(),
    tasks: new Map(),
    subtasks: new Map(),
    comments: new Map(),
  };

  async onModuleInit() {
    await this.seedInitialData();
  }

  async onModuleDestroy() {
    this.store.facilities.clear();
    this.store.users.clear();
    this.store.tasks.clear();
    this.store.subtasks.clear();
    this.store.comments.clear();
  }

  async seedInitialData() {
    if (this.store.facilities.size > 0) return;

    const facilityId = 'fac-001';
    const mainFacility: Facility = {
      id: facilityId,
      name: 'Central Campus',
      code: 'CAMPUS-01',
      address: '123 Education Boulevard, District 1',
      managerId: 'usr-mgr-central',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.facilities.set(facilityId, mainFacility);

    const westFacilityId = 'fac-002';
    const westFacility: Facility = {
      id: westFacilityId,
      name: 'West Campus',
      code: 'CAMPUS-02',
      address: '456 Academic Way, District 7',
      managerId: 'usr-mgr-west',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.facilities.set(westFacilityId, westFacility);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const adminId = 'usr-admin-01';
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

    const mgrCentralId = 'usr-mgr-central';
    const mgrCentralUser: User & { passwordHash: string } = {
      id: mgrCentralId,
      email: 'manager.central@wms.local',
      fullName: 'David Miller',
      role: Role.FACILITY_MANAGER,
      facilityId: facilityId,
      departmentId: null,
      teamId: null,
      managerId: adminId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash,
    };
    this.store.users.set(mgrCentralId, mgrCentralUser);

    const mgrWestId = 'usr-mgr-west';
    const mgrWestUser: User & { passwordHash: string } = {
      id: mgrWestId,
      email: 'manager.west@wms.local',
      fullName: 'Elena Rostova',
      role: Role.FACILITY_MANAGER,
      facilityId: westFacilityId,
      departmentId: null,
      teamId: null,
      managerId: adminId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash,
    };
    this.store.users.set(mgrWestId, mgrWestUser);

    const staffId = 'usr-staff-01';
    const staffUser: User & { passwordHash: string } = {
      id: staffId,
      email: 'teacher.sarah@wms.local',
      fullName: 'Sarah Jenkins',
      role: Role.TEACHER,
      facilityId,
      departmentId: null,
      teamId: null,
      managerId: mgrCentralId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash,
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

    const taskWestId = 'task-demo-02';
    const westTask: Task = {
      id: taskWestId,
      title: 'Setup West Campus Multimedia Classrooms',
      description: 'Equip audio systems and interactive projectors for Semester 2.',
      status: TaskStatus.NEW,
      priority: TaskPriority.MEDIUM,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      facilityId: westFacilityId,
      departmentId: null,
      teamId: null,
      creatorId: adminId,
      assignmentTargetType: AssignmentTargetType.USER,
      assigneeUserId: mgrWestId,
      assigneeTeamId: null,
      assigneeDepartmentId: null,
      completedAt: null,
      completedById: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: { id: adminUser.id, fullName: adminUser.fullName, email: adminUser.email },
      assigneeUser: { id: mgrWestUser.id, fullName: mgrWestUser.fullName, email: mgrWestUser.email },
      facility: { id: westFacility.id, name: westFacility.name, code: westFacility.code },
    };
    this.store.tasks.set(taskWestId, westTask);

    // Seed Demo Subtasks
    const subtask1: Subtask = {
      id: 'sub-001',
      taskId: taskId,
      title: 'Verify student prerequisite test scores',
      isCompleted: true,
      assigneeUserId: staffId,
      assigneeUser: { id: staffUser.id, fullName: staffUser.fullName },
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const subtask2: Subtask = {
      id: 'sub-002',
      taskId: taskId,
      title: 'Print official IELTS course syllabus & handouts',
      isCompleted: false,
      assigneeUserId: staffId,
      assigneeUser: { id: staffUser.id, fullName: staffUser.fullName },
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const subtask3: Subtask = {
      id: 'sub-003',
      taskId: taskId,
      title: 'Send welcome SMS to enrolled students',
      isCompleted: false,
      assigneeUserId: staffId,
      assigneeUser: { id: staffUser.id, fullName: staffUser.fullName },
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.subtasks.set(subtask1.id, subtask1);
    this.store.subtasks.set(subtask2.id, subtask2);
    this.store.subtasks.set(subtask3.id, subtask3);

    // Seed Demo Comments
    const comment1: TaskComment = {
      id: 'comment-001',
      taskId: taskId,
      authorId: mgrCentralId,
      content: 'Please ensure students with Band score < 5.0 are flagged for placement reassessment.',
      author: { id: mgrCentralUser.id, fullName: mgrCentralUser.fullName, email: mgrCentralUser.email },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };
    const comment2: TaskComment = {
      id: 'comment-002',
      taskId: taskId,
      authorId: staffId,
      content: 'Understood. Already checked the scores and printed handouts for batch A.',
      author: { id: staffUser.id, fullName: staffUser.fullName, email: staffUser.email },
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    };
    this.store.comments.set(comment1.id, comment1);
    this.store.comments.set(comment2.id, comment2);
  }
}
