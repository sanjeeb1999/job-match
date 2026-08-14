import neo4j from 'neo4j-driver';

export function toNumber(value: unknown): number {
  if (neo4j.isInt(value)) {
    return value.toNumber();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  throw new Error('Expected a numeric CognoDB value');
}

export function toNative<T = unknown>(value: unknown): T {
  if (value == null) {
    return value as T;
  }

  if (neo4j.isInt(value)) {
    return value.toNumber() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toNative(item)) as T;
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      result[key] = toNative(nested);
    }
    return result as T;
  }

  return value as T;
}

