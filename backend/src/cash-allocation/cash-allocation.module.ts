import { Module } from '@nestjs/common';
import { CashAllocationService } from './cash-allocation.service';
import { CashAllocationController } from './cash-allocation.controller';
import { EventBusModule } from '../common/event-bus/event-bus.module';

@Module({
  imports: [EventBusModule],
  controllers: [CashAllocationController],
  providers: [CashAllocationService],
  exports: [CashAllocationService],
})
export class CashAllocationModule {}
