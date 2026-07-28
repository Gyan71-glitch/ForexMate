import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches all roles along with their permissions.
   * Used by the Staff Portal for Role-Based Access Control (RBAC).
   */
  async getRolesWithPermissions() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }
}
