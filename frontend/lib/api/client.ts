import { ApiError, toFrontendSafeMessage } from "./errors";

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new ApiError(
      "The application is not configured to reach the API.",
      0,
    );
  }
  return base;
}

function buildUrl(path: string, params?: object): string {
  const url = new URL(path.replace(/^\//, ""), `${getApiBaseUrl()}/`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function readErrorPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function payloadMessage(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  return record.message;
}

export async function apiGet<T>(
  path: string,
  params?: object,
): Promise<T> {
  const url = buildUrl(path, params);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Unable to reach the backend. Please try again.", 0);
  }

  if (!response.ok) {
    const payload = await readErrorPayload(response);
    throw new ApiError(
      toFrontendSafeMessage(response.status, payloadMessage(payload)),
      response.status,
    );
  }

  return (await response.json()) as T;
}
