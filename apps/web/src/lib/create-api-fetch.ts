import { API_URL, LOGIN_PATH } from "@/config/api";
import { ApiError } from "@/lib/api-error";
import type {
  ApiErrorEnvelope,
  ApiFetch,
  ApiSuccessEnvelope,
} from "@/lib/api-types";

export function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === "/login") {
    return;
  }

  window.location.assign(LOGIN_PATH);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSuccessEnvelope<T>(value: unknown): value is ApiSuccessEnvelope<T> {
  return isRecord(value) && value.success === true && "data" in value;
}

function isErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return isRecord(value) && value.success === false;
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    await response.text().catch(() => "");
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  if (isErrorEnvelope(payload)) {
    return new ApiError(
      payload.message || "Request failed",
      status,
      payload.code || "INTERNAL_SERVER_ERROR",
      payload.details,
    );
  }

  return new ApiError("Request failed", status, "INTERNAL_SERVER_ERROR");
}

type ApiFetchOptions = {
  /** Forward incoming request headers (e.g. cookies) on server-side fetches. */
  getExtraHeaders?: () => Promise<HeadersInit | undefined>;
};

export function createApiFetch(
  getAccessToken: () => Promise<string | null>,
  onUnauthorized: () => void = redirectToLogin,
  options?: ApiFetchOptions,
): ApiFetch {
  return async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const headers = new Headers(init.headers);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = await getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const extraHeaders = await options?.getExtraHeaders?.();
    if (extraHeaders) {
      new Headers(extraHeaders).forEach((value, key) => {
        if (!headers.has(key)) {
          headers.set(key, value);
        }
      });
    }

    let response: Response;

    try {
      response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers,
        cache: init.cache ?? "no-store",
      });
    } catch {
      throw new ApiError(
        "Unable to reach the server",
        0,
        "NETWORK_ERROR",
      );
    }

    const payload = await readPayload(response);

    if (response.status === 401) {
      onUnauthorized();
    }

    if (!response.ok || isErrorEnvelope(payload)) {
      throw toApiError(response.status, payload);
    }

    if (isSuccessEnvelope<T>(payload)) {
      return payload.data;
    }

    throw new ApiError(
      "Unexpected API response",
      response.status,
      "INTERNAL_SERVER_ERROR",
    );
  };
}
