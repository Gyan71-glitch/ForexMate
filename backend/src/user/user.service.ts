import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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

  async getUserProfile(id: string) {
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

  async updateProfile(userId: string, data: any) {
    // Update User (fullName, mobile)
    if (data.fullName || data.phone) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.fullName ? { fullName: data.fullName } : {}),
          ...(data.phone ? { mobile: data.phone } : {}),
        }
      });
    }

    // Update CustomerProfile (panNumber)
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

  async addBank(userId: string, data: any) {
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

  async addAddress(userId: string, data: any) {
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

  async updateAddress(addressId: string, data: any) {
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

  async deleteAddress(addressId: string) {
    return this.prisma.customerAddress.delete({ where: { id: addressId } });
  }

  async deleteBank(bankId: string) {
    return this.prisma.customerBank.delete({ where: { id: bankId } });
  }

  async addKycDocument(userId: string, data: any) {
    return this.prisma.kycDocument.create({
      data: {
        docType: data.lockStatus || 'PASSPORT',
        filePath: data.imageOne || '',
        userId,
      },
    });
  }
}
