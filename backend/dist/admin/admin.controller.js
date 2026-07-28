'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AdminController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const admin_service_1 = require('./admin.service');
const jwt_auth_guard_1 = require('../auth/jwt-auth.guard');
const permissions_guard_1 = require('../auth/permissions.guard');
const permissions_decorator_1 = require('../auth/permissions.decorator');
const admin_dto_1 = require('./dto/admin.dto');
let AdminController = class AdminController {
  adminService;
  constructor(adminService) {
    this.adminService = adminService;
  }
  getDashboardSummary() {
    return this.adminService.getExecutiveMetrics();
  }
  getExecutiveMetrics() {
    return this.adminService.getExecutiveMetrics();
  }
  getAllOrders(req) {
    return this.adminService.getAllOrders(req.user);
  }
  getAllBranches() {
    return this.adminService.getAllBranches();
  }
  createBranch(dto, req) {
    return this.adminService.createBranch(dto, req.user.id);
  }
  updateBranch(id, dto) {
    return this.adminService.updateBranch(id, dto);
  }
  assignBranchManager(id, employeeId, req) {
    return this.adminService.assignBranchManager(id, employeeId, req.user.id);
  }
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
  getSystemSettings() {
    return this.adminService.getSystemSettings();
  }
  updateSystemSetting(body) {
    return this.adminService.updateSystemSetting(
      body.key,
      body.value,
      body.category,
    );
  }
  getStaffList() {
    return this.adminService.getStaffList();
  }
  createStaff(dto) {
    return this.adminService.createStaff(dto);
  }
  changeUserRole(id, role) {
    return this.adminService.changeUserRole(id, role);
  }
  changeUserStatus(id, status) {
    return this.adminService.changeUserStatus(id, status);
  }
};
exports.AdminController = AdminController;
__decorate(
  [
    (0, common_1.Get)('dashboard/summary'),
    (0, permissions_decorator_1.Permissions)('orders:read:all'),
    (0, swagger_1.ApiOperation)({
      summary: 'Executive Control Dashboard summary',
    }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'getDashboardSummary',
  null,
);
__decorate(
  [
    (0, common_1.Get)('executive-metrics'),
    (0, permissions_decorator_1.Permissions)('orders:read:all'),
    (0, swagger_1.ApiOperation)({ summary: 'Executive metrics overview' }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'getExecutiveMetrics',
  null,
);
__decorate(
  [
    (0, common_1.Get)('orders'),
    (0, permissions_decorator_1.Permissions)('orders:read:all'),
    __param(0, (0, common_1.Request)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'getAllOrders',
  null,
);
__decorate(
  [
    (0, common_1.Get)('branches'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'getAllBranches',
  null,
);
__decorate(
  [
    (0, common_1.Post)('branches'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'createBranch',
  null,
);
__decorate(
  [
    (0, common_1.Patch)('branches/:id'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Object]),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'updateBranch',
  null,
);
__decorate(
  [
    (0, common_1.Post)('branches/:id/assign-manager'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    (0, swagger_1.ApiOperation)({
      summary: 'Assign an existing BRANCH_MANAGER employee to a branch',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('employeeId')),
    __param(2, (0, common_1.Request)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Object]),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'assignBranchManager',
  null,
);
__decorate(
  [
    (0, common_1.Get)('audit-logs'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    (0, swagger_1.ApiOperation)({ summary: 'Searchable system audit trail' }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'getAuditLogs',
  null,
);
__decorate(
  [
    (0, common_1.Get)('settings'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'getSystemSettings',
  null,
);
__decorate(
  [
    (0, common_1.Post)('settings'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'updateSystemSetting',
  null,
);
__decorate(
  [
    (0, common_1.Get)('staff'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'getStaffList',
  null,
);
__decorate(
  [
    (0, common_1.Post)('staff'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [admin_dto_1.CreateStaffDto]),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'createStaff',
  null,
);
__decorate(
  [
    (0, common_1.Post)('users/:id/role'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'changeUserRole',
  null,
);
__decorate(
  [
    (0, common_1.Post)('users/:id/status'),
    (0, permissions_decorator_1.Permissions)('users:manage:all'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', void 0),
  ],
  AdminController.prototype,
  'changeUserStatus',
  null,
);
exports.AdminController = AdminController = __decorate(
  [
    (0, swagger_1.ApiTags)('Admin / ERP'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(
      jwt_auth_guard_1.JwtAuthGuard,
      permissions_guard_1.PermissionsGuard,
    ),
    (0, common_1.Controller)('admin'),
    __metadata('design:paramtypes', [admin_service_1.AdminService]),
  ],
  AdminController,
);
//# sourceMappingURL=admin.controller.js.map
