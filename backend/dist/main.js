"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder('ipv4first');
const app_module_1 = require("./app.module");
const path_1 = require("path");
const express_1 = require("express");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
const common_1 = require("@nestjs/common");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.setGlobalPrefix('api/v1');
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ limit: '50mb', extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const httpAdapterHost = app.get(core_1.HttpAdapterHost);
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(httpAdapterHost));
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const configured = (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim());
            if (configured.includes('*') || configured.includes(origin) || process.env.NODE_ENV !== 'production') {
                return callback(null, origin);
            }
            return callback(null, origin);
        },
        credentials: true,
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Forexmate API')
        .setDescription('The enterprise Forexmate exchange platform API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
process.on('unhandledRejection', (reason) => {
    const logger = new (require('@nestjs/common').Logger)('ProcessGuard');
    logger.error('Unhandled Promise Rejection — NOT crashing server', reason?.stack || reason);
});
process.on('uncaughtException', (err) => {
    const logger = new (require('@nestjs/common').Logger)('ProcessGuard');
    logger.error('Uncaught Exception — NOT crashing server', err?.stack || err.message);
});
//# sourceMappingURL=main.js.map