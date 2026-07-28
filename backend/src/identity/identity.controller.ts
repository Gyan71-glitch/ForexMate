import { Controller, Get, UseGuards } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('identity')
@UseGuards(JwtAuthGuard)
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get('roles')
  async getRoles() {
    const roles = await this.identityService.getRolesWithPermissions();
    return {
      success: true,
      data: roles
    };
  }
}
