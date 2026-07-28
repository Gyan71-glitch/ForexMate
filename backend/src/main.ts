import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import dns from 'dns';
// Force Node to resolve IPv4 addresses first to avoid local IPv6 connection routing bugs on macOS
dns.setDefaultResultOrder('ipv4first');

// Dev reload trigger
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  // Use Pino Logger
  app.useLogger(app.get(Logger));

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Increase payload size limit for Base64 camera photo uploads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Use Cookie Parser for secure refresh cookies
  app.use(cookieParser());

  // Global Pipes & Interceptors & Filters
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalInterceptors(new TransformInterceptor());
  
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Serve static files from the uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Forexmate API')
    .setDescription('The enterprise Forexmate exchange platform API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

// ─── Process-level crash guards ─────────────────────────────────────────────
// Prevents OCR worker failures (Tesseract, sharp, etc.) from crashing NestJS
// and logging everyone out.
process.on('unhandledRejection', (reason: any) => {
  const logger = new (require('@nestjs/common').Logger)('ProcessGuard');
  logger.error('Unhandled Promise Rejection — NOT crashing server', reason?.stack || reason);
});

process.on('uncaughtException', (err: Error) => {
  const logger = new (require('@nestjs/common').Logger)('ProcessGuard');
  logger.error('Uncaught Exception — NOT crashing server', err?.stack || err.message);
});
