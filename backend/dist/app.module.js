"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const transaction_module_1 = require("./transaction/transaction.module");
const forex_card_module_1 = require("./forex-card/forex-card.module");
const notification_module_1 = require("./notification/notification.module");
const rates_module_1 = require("./rates/rates.module");
const treasury_module_1 = require("./treasury/treasury.module");
const accounting_module_1 = require("./accounting/accounting.module");
const compliance_module_1 = require("./compliance/compliance.module");
const quotes_module_1 = require("./quotes/quotes.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const admin_module_1 = require("./admin/admin.module");
const public_module_1 = require("./public/public.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const documents_module_1 = require("./documents/documents.module");
const remittance_module_1 = require("./remittance/remittance.module");
const devtools_module_1 = require("./devtools/devtools.module");
const ops_module_1 = require("./ops/ops.module");
const event_bus_module_1 = require("./common/event-bus/event-bus.module");
const sync_module_1 = require("./common/sync/sync.module");
const common_services_module_1 = require("./common/services/common-services.module");
const cash_allocation_module_1 = require("./cash-allocation/cash-allocation.module");
const kyc_module_1 = require("./kyc/kyc.module");
const workforce_module_1 = require("./workforce/workforce.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: process.env.NODE_ENV !== 'production'
                        ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
                        : undefined,
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            transaction_module_1.TransactionModule,
            forex_card_module_1.ForexCardModule,
            notification_module_1.NotificationModule,
            rates_module_1.RatesModule,
            treasury_module_1.TreasuryModule,
            accounting_module_1.AccountingModule,
            compliance_module_1.ComplianceModule,
            quotes_module_1.QuotesModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            admin_module_1.AdminModule,
            public_module_1.PublicModule,
            dashboard_module_1.DashboardModule,
            documents_module_1.DocumentsModule,
            remittance_module_1.RemittanceModule,
            ops_module_1.OpsModule,
            event_bus_module_1.EventBusModule,
            sync_module_1.SyncModule,
            common_services_module_1.CommonServicesModule,
            cash_allocation_module_1.CashAllocationModule,
            kyc_module_1.KycModule,
            workforce_module_1.WorkforceModule,
            ...(process.env.NODE_ENV !== 'production'
                ? [devtools_module_1.DevToolsModule]
                : []),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map