import { createHash, randomBytes } from "node:crypto";

/** Generate a URL-safe high-entropy token (never store plaintext). */
export function generateSecureToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

/** SHA-256 hex digest used for token lookup. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
