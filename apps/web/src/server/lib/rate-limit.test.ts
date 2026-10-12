import { beforeEach, describe, expect, it } from "vitest";

import { ERROR_CODES } from "../errors/AppError";
import {
  assertRateLimit,
  getClientIdentity,
  resetRateLimitStore,
} from "./rate-limit";

beforeEach(() => {
  resetRateLimitStore();
});

describe("assertRateLimit", () => {
  it("allows requests under the limit", () => {
    expect(() =>
      assertRateLimit("127.0.0.1", {
        key: "demo",
        limit: 3,
        windowMs: 60_000,
      }),
    ).not.toThrow();
  });

  it("blocks once the limit is exceeded", () => {
    const options = { key: "demo", limit: 2, windowMs: 60_000 };

    assertRateLimit("10.0.0.1", options);
    assertRateLimit("10.0.0.1", options);

    expect(() => assertRateLimit("10.0.0.1", options)).toThrow(
      expect.objectContaining({
        statusCode: 429,
        code: ERROR_CODES.RATE_LIMITED,
      }),
    );
  });

  it("tracks identities independently", () => {
    const options = { key: "demo", limit: 1, windowMs: 60_000 };

    assertRateLimit("a", options);
    expect(() => assertRateLimit("b", options)).not.toThrow();
  });
});

describe("getClientIdentity", () => {
  it("prefers the first x-forwarded-for hop", () => {
    const request = new Request("http://localhost/api", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      },
    });

    expect(getClientIdentity(request)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip", () => {
    const request = new Request("http://localhost/api", {
      headers: { "x-real-ip": "198.51.100.7" },
    });

    expect(getClientIdentity(request)).toBe("198.51.100.7");
  });
});
