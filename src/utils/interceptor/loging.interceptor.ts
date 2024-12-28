import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging Interceptor
 * A custom interceptor that allows the app to override the built in NestJS Logger
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'http') {
      const restCtx = context.getArgs()[0];
      const rest_type = restCtx.method;
      const rest_args = restCtx.body;
      // const rest_req = restCtx;
      const rest_operation = context.getHandler().name;

      this.logger.log(
        `${rest_type}: ${rest_operation} ${JSON.stringify(rest_args)}`,
        'Audit: REST Request',
      );

      return next.handle().pipe(
        tap((res) => {
          this.logger.log(
            `${rest_type}: ${rest_operation} ${JSON.stringify(res)}`,
            'Audit: REST Response',
          );
        }),
      );
    }
  }
}
