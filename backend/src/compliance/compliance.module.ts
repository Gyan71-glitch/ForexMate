import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OcrAdapter } from './providers/ocr.adapter';

@Module({
  imports: [PrismaModule],
  controllers: [ComplianceController],
  providers: [ComplianceService, OcrAdapter],
  exports: [ComplianceService]
})
export class ComplianceModule {}
