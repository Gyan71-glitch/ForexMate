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
exports.DevKycService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DevKycService = class DevKycService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async applyKycPreset(userId, preset) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profiles: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.kycDocument.deleteMany({
            where: { userId },
        });
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 5);
        const closeDate = new Date();
        closeDate.setDate(closeDate.getDate() + 5);
        const farDate = new Date();
        farDate.setFullYear(farDate.getFullYear() + 8);
        switch (preset) {
            case 'APPROVED': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: {
                        riskCategory: 'LOW',
                        passportNo: 'Z9876543',
                        passportExpiry: farDate,
                        panNumber: 'ABCDE1234F',
                        kycOverallStatus: 'VERIFIED'
                    },
                });
                await this.prisma.order.updateMany({
                    where: { profile: { userId }, status: { in: ['PENDING', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED'] } },
                    data: { complianceStatus: 'APPROVED' }
                });
                await this.createMockDoc(userId, 'PAN', 'pan_card_verified.jpg', 'APPROVED', {
                    documentNumber: 'ABCDE1234F',
                    fullName: user.fullName || 'JOHN DOE',
                    confidence: 99.1,
                });
                await this.createMockDoc(userId, 'PASSPORT', 'passport_verified.jpg', 'APPROVED', {
                    documentNumber: 'Z9876543',
                    fullName: user.fullName || 'JOHN DOE',
                    expiryDate: farDate.toISOString().split('T')[0],
                    confidence: 98.4,
                });
                break;
            }
            case 'REJECTED': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: { riskCategory: 'LOW' },
                });
                await this.createMockDoc(userId, 'PAN', 'pan_card_invalid.jpg', 'REJECTED', {
                    documentNumber: '1111111111',
                    fullName: 'BAD FORMAT',
                    confidence: 45.0,
                });
                break;
            }
            case 'PENDING_REVIEW': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: { riskCategory: 'LOW' },
                });
                await this.createMockDoc(userId, 'PASSPORT', 'passport_pending.jpg', 'REVIEWING', {
                    documentNumber: 'Z9876543',
                    fullName: user.fullName || 'JOHN DOE',
                    expiryDate: farDate.toISOString().split('T')[0],
                    confidence: 90.0,
                });
                break;
            }
            case 'EXPIRED_PASSPORT': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: { riskCategory: 'LOW', passportNo: 'E9999999', passportExpiry: pastDate },
                });
                await this.createMockDoc(userId, 'PASSPORT', 'passport_expired.jpg', 'APPROVED', {
                    documentNumber: 'E9999999',
                    fullName: user.fullName || 'JOHN DOE',
                    expiryDate: pastDate.toISOString().split('T')[0],
                    confidence: 98.0,
                }, false);
                break;
            }
            case 'PASSPORT_EXPIRING_SOON': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: { riskCategory: 'LOW', passportNo: 'S8888888', passportExpiry: closeDate },
                });
                await this.createMockDoc(userId, 'PASSPORT', 'passport_expiring.jpg', 'APPROVED', {
                    documentNumber: 'S8888888',
                    fullName: user.fullName || 'JOHN DOE',
                    expiryDate: closeDate.toISOString().split('T')[0],
                    confidence: 98.0,
                });
                break;
            }
            case 'PAN_MISMATCH': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: { riskCategory: 'LOW' },
                });
                await this.createMockDoc(userId, 'PAN', 'pan_mismatch.jpg', 'REVIEWING', {
                    documentNumber: 'ABCDE1234F',
                    fullName: 'TOTALLY DIFFERENT NAME',
                    confidence: 98.0,
                }, true, false);
                break;
            }
            case 'OCR_LOW_CONFIDENCE': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: { riskCategory: 'LOW' },
                });
                await this.createMockDoc(userId, 'PAN', 'pan_blurry.jpg', 'PENDING', {
                    documentNumber: 'ABCDE1234F',
                    fullName: user.fullName || 'JOHN DOE',
                    confidence: 15.0,
                });
                break;
            }
            case 'AML_REVIEW': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: { riskCategory: 'HIGH' },
                });
                await this.createMockDoc(userId, 'PASSPORT', 'passport_aml.jpg', 'REVIEWING', {
                    documentNumber: 'A1111111',
                    fullName: user.fullName || 'JOHN DOE',
                    confidence: 99.0,
                });
                break;
            }
            case 'LRS_EXCEEDED': {
                const profileId = user.profiles?.id;
                if (profileId) {
                    const currentYear = new Date().getFullYear();
                    const fy = `${currentYear}-${currentYear + 1}`;
                    await this.prisma.lrsLimitTracker.upsert({
                        where: {
                            profileId_financialYear: {
                                profileId,
                                financialYear: fy,
                            },
                        },
                        update: {
                            systemSpentAmountUsd: 265000.0,
                        },
                        create: {
                            profileId,
                            financialYear: fy,
                            systemSpentAmountUsd: 265000.0,
                        },
                    });
                }
                break;
            }
            case 'MANUAL_VERIFICATION': {
                await this.prisma.customerProfile.update({
                    where: { userId },
                    data: { riskCategory: 'MEDIUM' },
                });
                await this.createMockDoc(userId, 'VISA', 'visa_manual.jpg', 'REVIEWING', {
                    documentNumber: 'V5555555',
                    fullName: user.fullName || 'JOHN DOE',
                    confidence: 85.0,
                });
                break;
            }
            default:
                throw new common_1.BadRequestException(`Unknown KYC preset: ${preset}`);
        }
        return { success: true, preset, userId };
    }
    async seedMockDocument(userId, options) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException(`User ${userId} not found`);
        const doc = await this.prisma.kycDocument.create({
            data: {
                userId,
                docType: options.docType,
                filePath: options.filePath || `dev-mock-${options.docType.toLowerCase()}.jpg`,
                status: options.status || 'PENDING',
                ocrData: {
                    create: {
                        extractedData: {
                            documentNumber: options.documentNumber || 'MOCK-DOC-001',
                            fullName: options.fullName || user.fullName || 'Test User',
                            dob: options.dob || '1995-01-01',
                        },
                        ocrConfidence: options.confidence ?? 97.5,
                        expiryValid: options.expiryValid ?? true,
                        nameMatched: options.nameMatched ?? true,
                    },
                },
            },
            include: {
                ocrData: true,
            },
        });
        return { success: true, document: doc };
    }
    async createMockDoc(userId, docType, filePath, status, extractedData, expiryValid = true, nameMatched = true) {
        return this.prisma.kycDocument.create({
            data: {
                userId,
                docType,
                filePath,
                status,
                ocrData: {
                    create: {
                        extractedData,
                        ocrConfidence: extractedData.confidence || 95.0,
                        expiryValid,
                        nameMatched,
                    },
                },
            },
        });
    }
};
exports.DevKycService = DevKycService;
exports.DevKycService = DevKycService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevKycService);
//# sourceMappingURL=dev-kyc.service.js.map