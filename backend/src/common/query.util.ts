import { BadRequestException } from '@nestjs/common';

const EXPERIENCE_LEVELS = new Set(['junior', 'mid', 'senior']);
const EMPLOYMENT_TYPES = new Set(['full-time', 'contract']);
const JOB_STATUSES = new Set(['open', 'closed']);

export function optionalText(value?: string): string {
  return value?.trim() ?? '';
}

export function requireId(id: string, label: string): string {
  const value = id?.trim();
  if (!value) {
    throw new BadRequestException(`Invalid ${label} id`);
  }
  return value;
}

export function optionalExperienceLevel(value?: string): string {
  const normalized = optionalText(value);
  if (normalized && !EXPERIENCE_LEVELS.has(normalized)) {
    throw new BadRequestException(
      'Invalid experienceLevel. Use junior, mid, or senior.',
    );
  }
  return normalized;
}

export function optionalEmploymentType(value?: string): string {
  const normalized = optionalText(value);
  if (normalized && !EMPLOYMENT_TYPES.has(normalized)) {
    throw new BadRequestException(
      'Invalid employmentType. Use full-time or contract.',
    );
  }
  return normalized;
}

export function optionalJobStatus(value?: string): string {
  const normalized = optionalText(value);
  if (normalized && !JOB_STATUSES.has(normalized)) {
    throw new BadRequestException('Invalid status. Use open or closed.');
  }
  return normalized;
}
