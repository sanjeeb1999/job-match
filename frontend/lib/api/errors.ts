export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "The request was invalid. Please try again.",
  404: "The requested information could not be found.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

function looksLikeStackTrace(message: string): boolean {
  return (
    message.length > 180 ||
    /\n\s+at\s/.test(message) ||
    /stack trace|exception|neo4j|bolt\+s?:\/\//i.test(message) ||
    /password|credential|cognodb_uri|cognodb_user|cognodb_password/i.test(
      message,
    )
  );
}

export function messageForStatus(status: number): string {
  return (
    STATUS_MESSAGES[status] ??
    "Something went wrong while talking to the backend. Please try again."
  );
}

export function toFrontendSafeMessage(
  status: number,
  rawMessage: unknown,
): string {
  if (typeof rawMessage === "string" && rawMessage.trim() && !looksLikeStackTrace(rawMessage)) {
    if (status === 503 || status === 400 || status === 404) {
      return messageForStatus(status);
    }
  }

  if (status === 0) {
    return "Unable to reach the backend. Please try again.";
  }

  return messageForStatus(status);
}
