import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppRole } from '../enums/roles.enum';

// Only CUSTOMER role is blocked from /ops/* (all staff/admin roles are welcome)
const OPS_BLOCKED_ROLES = [AppRole.CUSTOMER];

@Injectable()
export class BranchScopeGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated.');
    }

    // Fetch the user's role name from DB
    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId },
    });

    if (!role) {
      throw new ForbiddenException('User role not found.');
    }

    // Block CUSTOMER role from all /ops/* endpoints
    if (OPS_BLOCKED_ROLES.includes(role.name as AppRole)) {
      throw new ForbiddenException(
        'Access denied. Operations portal is for staff only.',
      );
    }

    // Allow global admin/central roles to bypass branch scoping entirely
    const globalRoles: string[] = [
      AppRole.SUPER_ADMIN,
      AppRole.OPERATIONS_ADMIN,
      AppRole.COMPLIANCE_ADMIN,
    ];
    if (globalRoles.includes(role.name)) {
      return true;
    }

    // For branch-scoped roles: if a specific branchId is targeted in the request,
    // verify the requesting user belongs to that branch.
    const targetBranchId =
      request.params?.branchId ||
      request.query?.branchId ||
      request.body?.branchId;

    if (!targetBranchId) {
      // No specific branchId targeted — controller scopes by user's own branchId
      return true;
    }

    // Check if the staff's assigned branch matches the requested target branch
    const staffProfile = await this.prisma.branchStaff.findUnique({
      where: { userId: user.userId || user.id },
    });

    if (!staffProfile || staffProfile.branchId !== targetBranchId) {
      throw new ForbiddenException(
        'Access denied. You do not have access to this branch.',
      );
    }

    return true;
  }
}
