import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KycController],
})
export class KycModule {}
