import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CityService } from './city.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Permissions } from '../../auth/permissions.decorator';

@ApiTags('Admin / City Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  @Permissions('users:manage:all')
  getAllCities() {
    return this.cityService.getAllCities();
  }

  @Post()
  @Permissions('users:manage:all')
  createCity(@Body() dto: { name: string; state: string; country?: string }, @Request() req: any) {
    return this.cityService.createCity(dto, req.user.id);
  }

  @Patch(':id')
  @Permissions('users:manage:all')
  updateCity(@Param('id') id: string, @Body() dto: { name?: string; state?: string; status?: string }) {
    return this.cityService.updateCity(id, dto);
  }

  @Delete(':id')
  @Permissions('users:manage:all')
  deleteCity(@Param('id') id: string) {
    return this.cityService.deleteCity(id);
  }
}
