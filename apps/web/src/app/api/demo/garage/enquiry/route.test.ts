import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, ERROR_CODES } from "@/server/errors/AppError";

const assertRateLimit = vi.fn();
const getClientIdentity = vi.fn(() => "127.0.0.1");
const parseBody = vi.fn();
const createLead = vi.fn();

vi.mock("@/server/lib/rate-limit", () => ({
  assertRateLimit: (...args: unknown[]) => assertRateLimit(...args),
  getClientIdentity: (...args: unknown[]) => getClientIdentity(...args),
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
}));

const route = await import("./route");

const validBody = {
  first_name: "Sam",
  last_name: "Taylor",
  email: "sam@example.com",
  phone: "07111222333",
  registration: "AB12 CDE",
  make: "Ford",
  model: "Focus",
  message: "Brakes squealing",
  company_website: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  getClientIdentity.mockReturnValue("127.0.0.1");
  assertRateLimit.mockImplementation(() => undefined);
});

describe("POST /api/demo/garage/enquiry", () => {
  it("creates a lead without requiring authentication", async () => {
    parseBody.mockResolvedValue(validBody);
    createLead.mockResolvedValue({
      id: "job-1",
      job_number: "JOB-000099",
      status: "LEAD",
    });

    const response = await route.POST(
      new Request("http://localhost/api/demo/garage/enquiry", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual({
      success: true,
      data: {
        id: "job-1",
        job_number: "JOB-000099",
        status: "LEAD",
      },
    });
    expect(createLead).toHaveBeenCalledWith({
      first_name: "Sam",
      last_name: "Taylor",
      email: "sam@example.com",
      phone: "07111222333",
      registration: "AB12 CDE",
      make: "Ford",
      model: "Focus",
      message: "Brakes squealing",
    });
  });

  it("returns validation errors for invalid bodies", async () => {
    parseBody.mockRejectedValue(
      new AppError("Validation failed", 400, ERROR_CODES.VALIDATION_ERROR, {
        email: ["Invalid email address"],
      }),
    );

    const response = await route.POST(
      new Request("http://localhost/api/demo/garage/enquiry", {
        method: "POST",
        body: JSON.stringify({ email: "bad" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    assertRateLimit.mockImplementation(() => {
      throw new AppError(
        "Too many enquiries. Please try again shortly.",
        429,
        ERROR_CODES.RATE_LIMITED,
      );
    });

    const response = await route.POST(
      new Request("http://localhost/api/demo/garage/enquiry", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(429);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("surfaces database failures as 500", async () => {
    parseBody.mockResolvedValue(validBody);
    createLead.mockRejectedValue(new Error("database offline"));

    const response = await route.POST(
      new Request("http://localhost/api/demo/garage/enquiry", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(500);
  });
});
