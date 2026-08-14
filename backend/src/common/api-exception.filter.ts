import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { isDatabaseError } from './database-error';
import { redactForLogs, safeHttpMessage } from './safe-error';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      response.status(status).json(this.toSafePayload(status, payload));
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    this.logger.error(`Request failed: ${redactForLogs(message)}`);

    if (isDatabaseError(exception)) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database unavailable',
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private toSafePayload(status: number, payload: string | object): object {
    if (typeof payload === 'string') {
      return {
        statusCode: status,
        message: safeHttpMessage(status, payload),
      };
    }

    const record = payload as Record<string, unknown>;
    const next: Record<string, unknown> = { ...record };

    if ('message' in next) {
      next.message = safeHttpMessage(status, next.message);
    }

    delete next.stack;
    delete next.query;
    delete next.cypher;

    return next;
  }
}
