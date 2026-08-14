import { BadRequestException } from '@nestjs/common';

export function optionalLimit(value?: string, fallback = 10): number {
  if (value == null || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
    throw new BadRequestException('Invalid limit. Use an integer from 1 to 50.');
  }

  return parsed;
}
