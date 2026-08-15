import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import express from 'express';

const server = express();
let isInitialized = false;

async function bootstrap() {
  if (!isInitialized) {
    const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(server),
      { bufferLogs: true }
    );

    app.setGlobalPrefix('api/v1');

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));
    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    app.useGlobalInterceptors(new TransformInterceptor());

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
        if (!origin) return callback(null, true);
        const configured = (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim());
        if (configured.includes('*') || configured.includes(origin) || process.env.NODE_ENV !== 'production') {
          return callback(null, origin);
        }
        return callback(null, origin);
      },
      credentials: true,
    });

    await app.init();
    isInitialized = true;
  }
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  server(req, res);
}
