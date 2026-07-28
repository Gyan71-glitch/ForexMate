import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QuotesModule } from '../quotes/quotes.module';
import { ComplianceModule } from '../compliance/compliance.module';

@Module({
  imports: [PrismaModule, QuotesModule, ComplianceModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
