import { z } from "zod";

export const declineQuoteSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(500, "Reason must be 500 characters or fewer")
    .optional()
    .default(""),
});

export const quoteTokenParamSchema = z
  .string()
  .trim()
  .min(20, "Invalid token")
  .max(128, "Invalid token")
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid token");
