import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = [];
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const res = exception.getResponse() as any;
      
      message = typeof res === 'string' ? res : (res.message || res.error || message);
      
      // If it's a ValidationPipe error, the message is usually an array of strings
      if (Array.isArray(res.message)) {
        details = res.message;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
      } else {
         code = res.error ? res.error.toUpperCase().replace(/\s+/g, '_') : 'HTTP_ERROR';
      }
    } else if (exception instanceof Error) {
       message = exception.message;
    }

    const responseBody = {
      success: false,
      error: {
        code,
        message,
        details,
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        timestamp: new Date().toISOString(),
      },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
