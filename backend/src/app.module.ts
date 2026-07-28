import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import { ForexCardModule } from './forex-card/forex-card.module';
import { NotificationModule } from './notification/notification.module';
import { RatesModule } from './rates/rates.module';
import { TreasuryModule } from './treasury/treasury.module';
import { AccountingModule } from './accounting/accounting.module';
import { ComplianceModule } from './compliance/compliance.module';
import { QuotesModule } from './quotes/quotes.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DocumentsModule } from './documents/documents.module';
import { RemittanceModule } from './remittance/remittance.module';
import { DevToolsModule } from './devtools/devtools.module';
import { OpsModule } from './ops/ops.module';
import { EventBusModule } from './common/event-bus/event-bus.module';
import { SyncModule } from './common/sync/sync.module';
import { CommonServicesModule } from './common/services/common-services.module';
import { CashAllocationModule } from './cash-allocation/cash-allocation.module';
import { KycModule } from './kyc/kyc.module';
import { WorkforceModule } from './workforce/workforce.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
      },
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    TransactionModule,
    ForexCardModule,
    NotificationModule,
    RatesModule,
    TreasuryModule,
    AccountingModule,
    ComplianceModule,
    QuotesModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
    PublicModule,
    DashboardModule,
    DocumentsModule,
    RemittanceModule,
    OpsModule,
    EventBusModule,
    SyncModule,
    CommonServicesModule,
    CashAllocationModule,
    KycModule,
    WorkforceModule,
    ...(process.env.NODE_ENV !== 'production'
      ? [DevToolsModule]
      : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

