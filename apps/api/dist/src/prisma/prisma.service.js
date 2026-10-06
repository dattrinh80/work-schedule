"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const shared_1 = require("@wms/shared");
let PrismaService = class PrismaService {
    constructor() {
        this.store = {
            facilities: new Map(),
            users: new Map(),
            tasks: new Map(),
        };
    }
    async onModuleInit() {
        await this.seedInitialData();
    }
    async onModuleDestroy() {
        this.store.facilities.clear();
        this.store.users.clear();
        this.store.tasks.clear();
    }
    async seedInitialData() {
        if (this.store.facilities.size > 0)
            return;
        const facilityId = 'fac-001';
        const mainFacility = {
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
        const adminUser = {
            id: adminId,
            email: 'admin@wms.local',
            fullName: 'System Administrator',
            role: shared_1.Role.SUPER_ADMIN,
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
        const staffUser = {
            id: staffId,
            email: 'teacher.sarah@wms.local',
            fullName: 'Sarah Jenkins',
            role: shared_1.Role.TEACHER,
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
        const demoTask = {
            id: taskId,
            title: 'Review IELTS Academic Class Roster',
            description: 'Verify attendance prerequisites and prepare course materials.',
            status: shared_1.TaskStatus.IN_PROGRESS,
            priority: shared_1.TaskPriority.HIGH,
            startDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            facilityId,
            departmentId: null,
            teamId: null,
            creatorId: adminId,
            assignmentTargetType: shared_1.AssignmentTargetType.USER,
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
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map