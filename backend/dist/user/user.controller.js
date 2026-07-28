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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const swagger_1 = require("@nestjs/swagger");
const user_dto_1 = require("./dto/user.dto");
let UserController = class UserController {
    userService;
    prisma;
    constructor(userService, prisma) {
        this.userService = userService;
        this.prisma = prisma;
    }
    getAllUsers() {
        return this.userService.getAllUsers();
    }
    async getProfile(id, req) {
        const requestedId = id;
        const userRole = await this.prisma.role.findUnique({
            where: { id: req.user.roleId },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        const userPermissions = userRole?.permissions.map((rp) => rp.permission.action) || [];
        const canReviewKyc = userPermissions.includes('kyc:review:all');
        const canManageUsers = userPermissions.includes('users:manage:all');
        const isOwnProfile = req.user.id === requestedId;
        if (!canReviewKyc && !canManageUsers && !isOwnProfile) {
            throw new common_1.ForbiddenException('You do not have permission to access this profile.');
        }
        return this.userService.getUserProfile(requestedId);
    }
    async updateProfile(id, data, req) {
        if (req.user.id !== id) {
            throw new common_1.ForbiddenException('You do not have permission to update this profile.');
        }
        return this.userService.updateProfile(id, data);
    }
    async updateProfilePut(id, data, req) {
        if (req.user.id !== id) {
            throw new common_1.ForbiddenException('You do not have permission to update this profile.');
        }
        return this.userService.updateProfile(id, data);
    }
    addBank(id, data, req) {
        const requestedId = id;
        if (req.user.id !== requestedId) {
            throw new common_1.ForbiddenException('Unauthorized bank access.');
        }
        return this.userService.addBank(requestedId, data);
    }
    deleteBank(id, bankId, req) {
        if (req.user.id !== id) {
            throw new common_1.ForbiddenException('Unauthorized bank access.');
        }
        return this.userService.deleteBank(bankId);
    }
    addAddress(id, data, req) {
        const requestedId = id;
        if (req.user.id !== requestedId) {
            throw new common_1.ForbiddenException('Unauthorized address access.');
        }
        return this.userService.addAddress(requestedId, data);
    }
    updateAddress(id, addressId, data, req) {
        if (req.user.id !== id) {
            throw new common_1.ForbiddenException('Unauthorized address access.');
        }
        return this.userService.updateAddress(addressId, data);
    }
    deleteAddress(id, addressId, req) {
        if (req.user.id !== id) {
            throw new common_1.ForbiddenException('Unauthorized address access.');
        }
        return this.userService.deleteAddress(addressId);
    }
    addKycDocument(id, lockStatus, file, req) {
        const requestedId = id;
        if (req.user.id !== requestedId) {
            throw new common_1.ForbiddenException('Unauthorized document upload.');
        }
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        if (!lockStatus) {
            throw new common_1.BadRequestException('Document type (lockStatus) is required');
        }
        return this.userService.addKycDocument(requestedId, {
            lockStatus,
            imageOne: file.filename,
        });
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('kyc:review:all'),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all users (Staff Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile and KYC status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden access to profile' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)(':id/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)(':id/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfilePut", null);
__decorate([
    (0, common_1.Post)(':id/banks'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a bank account to a user profile' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bank added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.AddBankDto, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "addBank", null);
__decorate([
    (0, common_1.Delete)(':id/banks/:bankId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user bank account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('bankId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "deleteBank", null);
__decorate([
    (0, common_1.Post)(':id/addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Add an address to a user profile' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Address added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.AddAddressDto, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Put)(':id/addresses/:addressId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a user address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('addressId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_dto_1.AddAddressDto, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)(':id/addresses/:addressId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('addressId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "deleteAddress", null);
__decorate([
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('kyc:upload:own'),
    (0, common_1.Post)(':id/kyc'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload KYC Document (Passport/Aadhaar)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'The KYC document image or PDF' },
                lockStatus: { type: 'string', example: 'PASSPORT', description: 'Document type (e.g., PASSPORT, AADHAAR)' },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('lockStatus')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "addKycDocument", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        prisma_service_1.PrismaService])
], UserController);
//# sourceMappingURL=user.controller.js.map