import { z } from "zod";

const trimString = z.string().trim().min(1, "Required");

export const createVehicleSchema = z.object({
  customer_id: z.uuid(),
  registration: trimString,
  make: trimString,
  model: trimString,
});

export const updateVehicleSchema = z
  .object({
    registration: trimString.optional(),
    make: trimString.optional(),
    model: trimString.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No update provided",
  });

