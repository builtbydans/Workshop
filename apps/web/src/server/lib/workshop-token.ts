import { createHmac, timingSafeEqual } from "crypto";
import env from "../config/env";
import type { ActorRole } from "../constants/job-status";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

export interface WorkshopTokenPayload {
  employeeId: string;
  role: ActorRole;
  exp: number;
}

const toBase64Url = (value: string) =>
  Buffer.from(value).toString("base64url");

const fromBase64Url = (value: string) =>
  Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string) =>
  createHmac("sha256", env.SUPABASE_SECRET_KEY).update(payload).digest("base64url");

export const createWorkshopToken = (
  employeeId: string,
  role: ActorRole,
) => {
  const payload: WorkshopTokenPayload = {
    employeeId,
    role,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  return `ws.${encoded}.${sign(encoded)}`;
};

export const readWorkshopToken = (
  token: string,
): WorkshopTokenPayload | null => {
  const [scheme, encoded, signature] = token.split(".");

  if (scheme !== "ws" || !encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as WorkshopTokenPayload;

    if (!payload.employeeId || !payload.role || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
