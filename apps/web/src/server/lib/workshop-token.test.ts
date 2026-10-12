import { describe, expect, it } from "vitest";

import {
  createWorkshopToken,
  readWorkshopToken,
} from "./workshop-token";

/**
 * Pure unit tests — no mocks, no HTTP, no database.
 *
 * workshop-token.ts only uses crypto + env, so we can test it directly.
 */
describe("workshop token", () => {
  it("round-trips a manager token", () => {
    const token = createWorkshopToken("emp-1", "MANAGER");
    const payload = readWorkshopToken(token);

    expect(payload).toMatchObject({
      employeeId: "emp-1",
      role: "MANAGER",
    });
    expect(payload?.exp).toBeGreaterThan(Date.now());
  });

  it("rejects a tampered token", () => {
    const token = createWorkshopToken("emp-1", "MANAGER");
    const tampered = `${token}x`;

    expect(readWorkshopToken(tampered)).toBeNull();
  });

  it("rejects a random string", () => {
    expect(readWorkshopToken("Bearer abc.def.ghi")).toBeNull();
  });
});
