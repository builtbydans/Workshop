import { z } from "zod";

const trimString = z.string().trim().min(1, "Required");

export const createLeadSchema = z.object({
  first_name: trimString,
  last_name: trimString,
  email: z.email("Invalid email address").transform((v) => v.toLowerCase()),
  phone: trimString,
  registration: trimString,
  make: trimString,
  model: trimString,
  message: trimString,
});

export const quoteLeadSchema = z.object({
  job_type: trimString,
  quoted_cost: z.coerce.number().positive("Quoted cost must be greater than 0"),
});

