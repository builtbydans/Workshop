import { promisify } from "util";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";

const scryptAsync = promisify(scrypt);
const PIN_PATTERN = /^\d{5}$/;

export const isValidPin = (pin: string) => PIN_PATTERN.test(pin);

export const hashPin = async (pin: string) => {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(pin, salt, 32)) as Buffer;

  return `scrypt:${salt}:${derived.toString("hex")}`;
};

export const verifyPin = async (pin: string, pinHash: string | null) => {
  if (!pinHash) {
    return false;
  }

  const [scheme, salt, key] = pinHash.split(":");

  if (scheme !== "scrypt" || !salt || !key) {
    return false;
  }

  const derived = (await scryptAsync(pin, salt, 32)) as Buffer;
  const expected = Buffer.from(key, "hex");

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
};
