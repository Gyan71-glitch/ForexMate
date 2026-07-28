"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevToolsModule = exports.MockTimeMiddleware = void 0;
const common_1 = require("@nestjs/common");
const devtools_controller_1 = require("./devtools.controller");
const dev_auth_service_1 = require("./services/dev-auth.service");
const dev_kyc_service_1 = require("./services/dev-kyc.service");
const dev_payment_service_1 = require("./services/dev-payment.service");
const dev_seed_service_1 = require("./services/dev-seed.service");
const dev_rate_service_1 = require("./services/dev-rate.service");
const dev_events_service_1 = require("./services/dev-events.service");
const dev_system_service_1 = require("./services/dev-system.service");
const prisma_module_1 = require("../prisma/prisma.module");
const jwt_1 = require("@nestjs/jwt");
let MockTimeMiddleware = class MockTimeMiddleware {
    use(req, res, next) {
        const mockTime = req.headers['x-mock-time'];
        if (mockTime) {
            global.devMockTime = mockTime;
        }
        next();
    }
};
exports.MockTimeMiddleware = MockTimeMiddleware;
exports.MockTimeMiddleware = MockTimeMiddleware = __decorate([
    (0, common_1.Injectable)()
], MockTimeMiddleware);
const notification_module_1 = require("../notification/notification.module");
let DevToolsModule = class DevToolsModule {
    configure(consumer) {
        consumer.apply(MockTimeMiddleware).forRoutes('*');
    }
};
exports.DevToolsModule = DevToolsModule;
exports.DevToolsModule = DevToolsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            notification_module_1.NotificationModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
                signOptions: { expiresIn: '365d' },
            }),
        ],
        controllers: [devtools_controller_1.DevToolsController],
        providers: [
            dev_auth_service_1.DevAuthService,
            dev_kyc_service_1.DevKycService,
            dev_payment_service_1.DevPaymentService,
            dev_seed_service_1.DevSeedService,
            dev_rate_service_1.DevRateService,
            dev_events_service_1.DevEventsService,
            dev_system_service_1.DevSystemService,
        ],
        exports: [
            dev_auth_service_1.DevAuthService,
            dev_kyc_service_1.DevKycService,
            dev_payment_service_1.DevPaymentService,
            dev_seed_service_1.DevSeedService,
            dev_rate_service_1.DevRateService,
            dev_events_service_1.DevEventsService,
            dev_system_service_1.DevSystemService,
        ],
    })
], DevToolsModule);
//# sourceMappingURL=devtools.module.js.map