import { Module } from '@nestjs/common';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FastForexAdapter } from './providers/fastforex.adapter';

@Module({
  imports: [PrismaModule],
  controllers: [RatesController],
  providers: [RatesService, FastForexAdapter],
  exports: [RatesService],
})
export class RatesModule {}
