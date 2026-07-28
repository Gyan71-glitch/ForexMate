import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // Check if data already conforms to Response shape (in case of paginated lists returning meta)
        if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
          return data;
        }

        // Handle specific cases where data might come with meta attached
        if (data && typeof data === 'object' && data.meta && data.data) {
           return {
             success: true,
             data: data.data,
             meta: data.meta
           }
        }

        return {
          success: true,
          data: data,
          meta: {}
        };
      })
    );
  }
}
