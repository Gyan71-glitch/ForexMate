import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class DevAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a temporary access token for impersonation or role-switching.
   */
  async generateImpersonationToken(email: string, roleOverride?: string) {
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { roleRef: true },
    });

    if (!user) {
      // Create user on the fly if it is a dev email
      if (email.endsWith('@forexmate.com') || email.endsWith('@forexmate.dev')) {
        const defaultRole = await this.prisma.role.findFirst({
          where: { name: roleOverride || 'CUSTOMER' },
        });

        const passHash = await bcrypt.hash('admin123', 10);
        user = await this.prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              password: passHash,
              fullName: email.split('@')[0].toUpperCase(),
              roleId: defaultRole ? defaultRole.id : null,
              isEmailVerified: true,
            },
            include: { roleRef: true },
          });

          await tx.customerProfile.create({
            data: {
              userId: newUser.id,
              riskCategory: 'LOW',
            },
          });

          return newUser;
        });
      } else {
        throw new NotFoundException(`User with email ${email} not found.`);
      }
    }

    // Determine target role ID
    let targetRoleId = user.roleId;
    let targetRoleName = user.roleRef?.name || 'CUSTOMER';

    if (roleOverride) {
      const roleObj = await this.prisma.role.findUnique({
        where: { name: roleOverride },
      });
      if (!roleObj) {
        throw new BadRequestException(`Role ${roleOverride} not found in database.`);
      }
      targetRoleId = roleObj.id;
      targetRoleName = roleObj.name;
    }

    // Resolve company and branch mappings for user
    const staff = await this.prisma.branchStaff.findUnique({
      where: { userId: user.id },
      include: { branch: true },
    });

    // Create a new session in DB
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const hashedRefreshToken = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days

    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashedRefreshToken,
        expiresAt,
        ip: '127.0.0.1',
        country: 'India',
        city: 'Mumbai',
        os: 'macOS',
        browser: 'Chrome',
      },
    });

    // Sign the token with temporary role ID override
    const accessPayload = {
      sub: user.id,
      sessionId: session.id,
      roleId: targetRoleId,
      companyId: staff?.branch?.companyId || null,
      branchId: staff?.branchId || null,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: '365d',
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: targetRoleName,
      },
    };
  }

  /**
   * Returns a list of active dev-impersonateable users.
   */
  async getSessions() {
    return this.prisma.user.findMany({
      take: 20,
      include: { roleRef: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
