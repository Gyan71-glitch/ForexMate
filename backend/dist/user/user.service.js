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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                mobile: true,
                roleRef: {
                    select: {
                        name: true,
                    },
                },
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getUserProfile(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                profiles: {
                    include: {
                        addresses: true,
                        banks: true,
                    },
                },
                KycDocument: true,
            },
        });
    }
    async updateProfile(userId, data) {
        if (data.fullName || data.phone) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    ...(data.fullName ? { fullName: data.fullName } : {}),
                    ...(data.phone ? { mobile: data.phone } : {}),
                }
            });
        }
        if (data.panNumber) {
            let profile = await this.prisma.customerProfile.findUnique({
                where: { userId },
            });
            if (!profile) {
                profile = await this.prisma.customerProfile.create({
                    data: { userId },
                });
            }
            await this.prisma.customerProfile.update({
                where: { id: profile.id },
                data: { panNumber: data.panNumber }
            });
        }
        return this.getUserProfile(userId);
    }
    async addBank(userId, data) {
        let profile = await this.prisma.customerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            profile = await this.prisma.customerProfile.create({
                data: { userId },
            });
        }
        return this.prisma.customerBank.create({
            data: {
                bankName: data.bankName || '',
                holderName: data.holderName || '',
                accountNumber: data.accountNumber || '',
                ifscCode: data.ifscCode || '',
                bankAddress: data.bankAddress,
                profileId: profile.id,
            },
        });
    }
    async addAddress(userId, data) {
        let profile = await this.prisma.customerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            profile = await this.prisma.customerProfile.create({
                data: { userId },
            });
        }
        return this.prisma.customerAddress.create({
            data: {
                pin: data.pin || '',
                city: data.city || '',
                state: data.state || '',
                address: data.address || '',
                landmark: data.landmark,
                addressType: data.addressType || 'RESIDENTIAL',
                profileId: profile.id,
            },
        });
    }
    async updateAddress(addressId, data) {
        return this.prisma.customerAddress.update({
            where: { id: addressId },
            data: {
                pin: data.pin,
                city: data.city,
                state: data.state,
                address: data.address,
                landmark: data.landmark,
                addressType: data.addressType,
            },
        });
    }
    async deleteAddress(addressId) {
        return this.prisma.customerAddress.delete({ where: { id: addressId } });
    }
    async deleteBank(bankId) {
        return this.prisma.customerBank.delete({ where: { id: bankId } });
    }
    async addKycDocument(userId, data) {
        return this.prisma.kycDocument.create({
            data: {
                docType: data.lockStatus || 'PASSPORT',
                filePath: data.imageOne || '',
                userId,
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map