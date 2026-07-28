import { Module, NestModule, MiddlewareConsumer, NestMiddleware, Injectable } from '@nestjs/common';
import { DevToolsController } from './devtools.controller';
import { DevAuthService } from './services/dev-auth.service';
import { DevKycService } from './services/dev-kyc.service';
import { DevPaymentService } from './services/dev-payment.service';
import { DevSeedService } from './services/dev-seed.service';
import { DevRateService } from './services/dev-rate.service';
import { DevEventsService } from './services/dev-events.service';
import { DevSystemService } from './services/dev-system.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MockTimeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const mockTime = req.headers['x-mock-time'];
    if (mockTime) {
      (global as any).devMockTime = mockTime;
    }
    next();
  }
}

import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [DevToolsController],
  providers: [
    DevAuthService,
    DevKycService,
    DevPaymentService,
    DevSeedService,
    DevRateService,
    DevEventsService,
    DevSystemService,
  ],
  exports: [
    DevAuthService,
    DevKycService,
    DevPaymentService,
    DevSeedService,
    DevRateService,
    DevEventsService,
    DevSystemService,
  ],
})
export class DevToolsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MockTimeMiddleware).forRoutes('*');
  }
}

