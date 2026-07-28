import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roleId) {
      throw new ForbiddenException('Access denied. No active role associated.');
    }

    // Retrieve permissions for the user's role
    const roleWithPermissions = await this.prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!roleWithPermissions) {
      throw new ForbiddenException('Role not found.');
    }

    if (roleWithPermissions.name === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions = roleWithPermissions.permissions.map(
      (rp) => rp.permission.action,
    );

    // Verify if user possesses all of the required permissions
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have the required permissions to perform this action.',
      );
    }

    return true;
  }
}
