import { Module } from '@nestjs/common';
import { OpsController } from './ops.controller';
import { OpsService } from './ops.service';
import { ComplianceModule } from '../compliance/compliance.module';

@Module({
  imports: [ComplianceModule],
  controllers: [OpsController],
  providers: [OpsService]
})
export class OpsModule {}
