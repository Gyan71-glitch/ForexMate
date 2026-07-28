import { Module } from '@nestjs/common';
import { RemittanceService } from './remittance.service';
import { RemittanceController } from './remittance.controller';

@Module({
  providers: [RemittanceService],
  controllers: [RemittanceController]
})
export class RemittanceModule {}
