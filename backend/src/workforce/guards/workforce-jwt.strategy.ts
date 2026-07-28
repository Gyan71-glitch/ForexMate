import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkforceJwtStrategy extends PassportStrategy(Strategy, 'workforce-jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'forexmate-secret',
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'WORKFORCE') {
      throw new UnauthorizedException('Invalid token type for workforce access.');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: payload.sub },
      include: { branch: true },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      throw new UnauthorizedException('Employee account not found or deactivated.');
    }

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      role: employee.role,
      branchId: employee.branchId,
      branchName: employee.branch?.branchName || '',
    };
  }
}
