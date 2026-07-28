import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { WorkforceController } from './workforce.controller';
import { WorkforceService } from './workforce.service';
import { WorkforceJwtStrategy } from './guards/workforce-jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { EventBusModule } from '../common/event-bus/event-bus.module';

@Module({
  imports: [
    PrismaModule,
    EventBusModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'forexmate-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [WorkforceController],
  providers: [WorkforceService, WorkforceJwtStrategy],
})
export class WorkforceModule {}
