import { z } from "zod";

const trimString = z.string().trim().min(1, "Required");

export const createCustomerSchema = z.object({
  first_name: trimString,
  last_name: trimString,
  phone: trimString,
  email: z.email("Invalid email address").transform((v) => v.toLowerCase()),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No update provided",
  });

