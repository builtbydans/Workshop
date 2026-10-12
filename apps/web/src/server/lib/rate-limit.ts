import { AppError, ERROR_CODES } from "../errors/AppError";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  /** Unique key for the limiter (e.g. "demo-garage-enquiry"). */
  key: string;
  /** Max requests allowed in the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Optional override for the 429 message. */
  message?: string;
};

const buckets = new Map<string, RateLimitBucket>();

function pruneExpired(now: number) {
  for (const [id, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(id);
    }
  }
}

/**
 * Simple in-memory sliding-window rate limiter for demo public endpoints.
 * Suitable for single-instance demos; not a distributed production limiter.
 */
export function assertRateLimit(
  identity: string,
  options: RateLimitOptions,
): void {
  const now = Date.now();
  pruneExpired(now);

  const bucketId = `${options.key}:${identity}`;
  const existing = buckets.get(bucketId);

  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketId, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return;
  }

  if (existing.count >= options.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    );

    throw new AppError(
      options.message ?? "Too many requests. Please try again shortly.",
      429,
      ERROR_CODES.RATE_LIMITED,
      { retry_after: [`${retryAfterSeconds}`] },
    );
  }

  existing.count += 1;
}

export function getClientIdentity(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/** Test helper — clears all buckets between cases. */
export function resetRateLimitStore() {
  buckets.clear();
}
