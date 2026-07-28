import { Global, Module } from '@nestjs/common';
import { WorkflowValidatorService } from './workflow-validator.service';
import { IntegrityCheckerService } from './integrity-checker.service';

@Global()
@Module({
  providers: [WorkflowValidatorService, IntegrityCheckerService],
  exports: [WorkflowValidatorService, IntegrityCheckerService],
})
export class CommonServicesModule {}
