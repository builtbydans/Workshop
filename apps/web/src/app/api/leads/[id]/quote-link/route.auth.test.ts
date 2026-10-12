import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, ERROR_CODES } from "@/server/errors/AppError";

const requireAuth = vi.fn();
const createOrRotateQuoteLink = vi.fn();

vi.mock("@/server/lib/auth", () => ({
  requireAuth: (...args: unknown[]) => requireAuth(...args),
}));

vi.mock("@/server/modules/quote-token/quote-token.service", () => ({
  createOrRotateQuoteLink: (...args: unknown[]) =>
    createOrRotateQuoteLink(...args),
}));

const route = await import("./route");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/leads/[id]/quote-link", () => {
  it("rejects unauthenticated access", async () => {
    requireAuth.mockRejectedValue(
      new AppError("Authentication required", 401, ERROR_CODES.UNAUTHORIZED),
    );

    const response = await route.POST(
      new Request("http://localhost/api/leads/job-1/quote-link", {
        method: "POST",
      }),
      { params: Promise.resolve({ id: "job-1" }) },
    );

    expect(response.status).toBe(401);
    expect(createOrRotateQuoteLink).not.toHaveBeenCalled();
  });

  it("creates a link for authenticated staff", async () => {
    requireAuth.mockResolvedValue({ userId: "u1" });
    createOrRotateQuoteLink.mockResolvedValue({
      url: "http://localhost:3000/demo/garage/quote/abc",
      expires_at: new Date().toISOString(),
      job_number: "JOB-2026-000010",
    });

    const response = await route.POST(
      new Request("http://localhost/api/leads/job-1/quote-link", {
        method: "POST",
      }),
      { params: Promise.resolve({ id: "job-1" }) },
    );

    expect(response.status).toBe(201);
    expect(createOrRotateQuoteLink).toHaveBeenCalledWith("job-1");
  });
});
