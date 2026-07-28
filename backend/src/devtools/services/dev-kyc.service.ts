import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus } from '@prisma/client';

export interface MockDocumentOptions {
  docType: string;
  filePath?: string;
  status?: KycStatus;
  documentNumber?: string;
  fullName?: string;
  dob?: string;
  confidence?: number;
  nameMatched?: boolean;
  expiryValid?: boolean;
}

@Injectable()
export class DevKycService {
  constructor(private readonly prisma: PrismaService) {}

  async applyKycPreset(userId: string, preset: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profiles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Clean existing KYC documents to prevent conflicts
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
        }, false); // expiryValid: false
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
        }, true, false); // nameMatched: false
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
        throw new BadRequestException(`Unknown KYC preset: ${preset}`);
    }

    return { success: true, preset, userId };
  }

  /**
   * Directly seed a KYC document without file upload.
   * Used for dev E2E tests to bypass multipart/form-data requirement.
   */
  async seedMockDocument(userId: string, options: MockDocumentOptions) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

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

  private async createMockDoc(
    userId: string,
    docType: string,
    filePath: string,
    status: KycStatus,
    extractedData: any,
    expiryValid = true,
    nameMatched = true,
  ) {
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
}
