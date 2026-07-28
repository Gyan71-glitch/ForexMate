import { NestModule, MiddlewareConsumer, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class MockTimeMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class DevToolsModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}
