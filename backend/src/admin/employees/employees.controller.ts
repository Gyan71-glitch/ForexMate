import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, ResetPasswordDto, UpdateEmployeeStatusDto } from './dto/employee.dto';

@ApiTags('Admin / Employee Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Permissions('users:manage:all')
  create(@Body() dto: CreateEmployeeDto, @Request() req: any) {
    return this.employeesService.create(dto, req.user);
  }

  @Get()
  @Permissions('users:manage:all')
  findAll(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.employeesService.findAll({ search, role, branchId, status, page, limit });
  }

  @Get(':id')
  @Permissions('users:manage:all')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @Permissions('users:manage:all')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Request() req: any) {
    return this.employeesService.update(id, dto, req.user);
  }

  @Post(':id/reset-password')
  @Permissions('users:manage:all')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto, @Request() req: any) {
    return this.employeesService.resetPassword(id, dto, req.user);
  }

  @Post(':id/status')
  @Permissions('users:manage:all')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateEmployeeStatusDto, @Request() req: any) {
    return this.employeesService.updateStatus(id, dto, req.user);
  }

  @Delete(':id')
  @Permissions('users:manage:all')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.employeesService.remove(id, req.user);
  }
}
