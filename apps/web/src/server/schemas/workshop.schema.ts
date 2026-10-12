import { z } from "zod";

export const clockInSchema = z.object({
  employeeId: z.string().uuid(),
  pin: z.string().regex(/^\d{5}$/, "PIN must be a 5-digit code."),
});

