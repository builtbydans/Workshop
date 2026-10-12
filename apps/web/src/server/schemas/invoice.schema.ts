import { z } from "zod";

export const generateInvoiceSchema = z.object({
  job_id: z.string().uuid(),
});

