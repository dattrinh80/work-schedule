export var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["ADMIN"] = "ADMIN";
    Role["FACILITY_MANAGER"] = "FACILITY_MANAGER";
    Role["DEPARTMENT_MANAGER"] = "DEPARTMENT_MANAGER";
    Role["TEAM_LEADER"] = "TEAM_LEADER";
    Role["STAFF"] = "STAFF";
    Role["TEACHER"] = "TEACHER";
})(Role || (Role = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["NEW"] = "NEW";
    TaskStatus["ASSIGNED"] = "ASSIGNED";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["BLOCKED"] = "BLOCKED";
    TaskStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["CANCELLED"] = "CANCELLED";
    TaskStatus["OVERDUE"] = "OVERDUE";
})(TaskStatus || (TaskStatus = {}));
export var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["URGENT"] = "URGENT";
})(TaskPriority || (TaskPriority = {}));
export var AssignmentTargetType;
(function (AssignmentTargetType) {
    AssignmentTargetType["USER"] = "USER";
    AssignmentTargetType["TEAM"] = "TEAM";
    AssignmentTargetType["DEPARTMENT"] = "DEPARTMENT";
})(AssignmentTargetType || (AssignmentTargetType = {}));
//# sourceMappingURL=enums.js.map