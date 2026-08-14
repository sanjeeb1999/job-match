const UNSAFE_CLIENT_PATTERN =
  /bolt(\+ssc|\+s)?:\/\/|neo4j(\+s)?:\/\/|cognodb_password|cognodb_uri|password\s*[=:]|cypher|stack trace|\n\s+at\s|ECONNREFUSED|ENOENT|[A-Za-z]:\\Users\\/i;

export function looksUnsafeForClient(value: unknown): boolean {
  return typeof value === 'string' && UNSAFE_CLIENT_PATTERN.test(value);
}

export function redactForLogs(message: string): string {
  return message
    .replace(/bolt(\+ssc|\+s)?:\/\/\S+/gi, '[redacted-uri]')
    .replace(/neo4j(\+s)?:\/\/\S+/gi, '[redacted-uri]')
    .replace(/(password\s*[=:]\s*)\S+/gi, '$1[redacted]');
}

export function safeHttpMessage(
  status: number,
  message: unknown,
): string {
  if (typeof message === 'string' && message.trim() && !looksUnsafeForClient(message)) {
    return message;
  }

  if (status === 400) {
    return 'Invalid request';
  }
  if (status === 404) {
    return 'Not found';
  }
  if (status === 503) {
    return 'Database unavailable';
  }
  return 'Internal server error';
}
