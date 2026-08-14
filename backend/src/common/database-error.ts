import { HttpException, HttpStatus } from '@nestjs/common';

export function isDatabaseError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const name = 'name' in error ? String(error.name) : '';
  const code = 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message : '';

  return (
    name === 'Neo4jError' ||
    code.startsWith('Neo.') ||
    /CognoDB|Failed to connect|ServiceUnavailable|SessionExpired|unauthorized/i.test(
      message,
    )
  );
}

export function databaseUnavailable(): HttpException {
  return new HttpException(
    {
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database unavailable',
    },
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}
