import { describe, expect, it } from "vitest";

import { generateSecureToken, hashToken } from "./token-crypto";

describe("token-crypto", () => {
  it("generates url-safe tokens of sufficient length", () => {
    const token = generateSecureToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("hashes deterministically without revealing the plaintext", () => {
    const token = "demo-token-value-abcdefghijklmnopqrstuv";
    const hash = hashToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(token);
    expect(hashToken(token)).toBe(hash);
  });
});
