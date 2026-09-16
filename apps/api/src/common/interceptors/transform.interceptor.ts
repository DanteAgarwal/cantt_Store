import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@cantt/types';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If the controller already returned an object structured as { data, meta }
        if (
          res &&
          typeof res === 'object' &&
          'data' in res &&
          ('meta' in res || Object.keys(res).length <= 2)
        ) {
          return res;
        }
        return { data: res };
      }),
    );
  }
}
