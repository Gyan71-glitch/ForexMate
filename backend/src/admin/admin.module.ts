import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { EmployeesController } from './employees/employees.controller';
import { EmployeesService } from './employees/employees.service';
import { CityController } from './city/city.controller';
import { CityService } from './city/city.service';
import { VaultTransferController } from './vault-transfer/vault-transfer.controller';
import { VaultTransferService } from './vault-transfer/vault-transfer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminController,
    EmployeesController,
    CityController,
    VaultTransferController,
  ],
  providers: [
    AdminService,
    EmployeesService,
    CityService,
    VaultTransferService,
  ],
  exports: [EmployeesService, CityService, VaultTransferService],
})
export class AdminModule {}
