import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, ERROR_CODES } from "@/server/errors/AppError";

const requireAuth = vi.fn();
const parseBody = vi.fn();
const createLead = vi.fn();
const getLeads = vi.fn();

vi.mock("@/server/lib/auth", () => ({
  requireAuth: (...args: unknown[]) => requireAuth(...args),
}));

vi.mock("@/server/lib/http", async () => {
  const actual = await vi.importActual<typeof import("@/server/lib/http")>(
    "@/server/lib/http",
  );
  return {
    ...actual,
    parseBody: (...args: unknown[]) => parseBody(...args),
  };
});

vi.mock("@/server/modules/lead/lead.service", () => ({
  createLead: (...args: unknown[]) => createLead(...args),
  getLeads: (...args: unknown[]) => getLeads(...args),
}));

const route = await import("./route");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/leads", () => {
  it("rejects unauthenticated staff lead creation", async () => {
    requireAuth.mockRejectedValue(
      new AppError("Authentication required", 401, ERROR_CODES.UNAUTHORIZED),
    );

    const response = await route.POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(401);
    expect(createLead).not.toHaveBeenCalled();
  });
});

describe("GET /api/leads", () => {
  it("rejects unauthenticated lead listing", async () => {
    requireAuth.mockRejectedValue(
      new AppError("Authentication required", 401, ERROR_CODES.UNAUTHORIZED),
    );

    const response = await route.GET(
      new Request("http://localhost/api/leads"),
    );

    expect(response.status).toBe(401);
    expect(getLeads).not.toHaveBeenCalled();
  });
});
