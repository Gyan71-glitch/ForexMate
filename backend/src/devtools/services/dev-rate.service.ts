import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DevRateService {
  constructor(private readonly prisma: PrismaService) {}

  async setRateMode(mode: string) {
    (global as any).devRateMode = mode;
    return { success: true, mode };
  }

  async getRateMode() {
    return { mode: (global as any).devRateMode || 'NORMAL' };
  }
}
