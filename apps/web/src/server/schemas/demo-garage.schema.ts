import { z } from "zod";
import { createLeadSchema } from "./lead.schema";

/**
 * Public garage enquiry body.
 * Extends the shared lead contract with a honeypot field for basic bot abuse protection.
 */
export const publicGarageEnquirySchema = createLeadSchema
  .omit({ message: true })
  .extend({
    /** Honeypot — must stay empty. Bots that fill hidden fields are rejected. */
    company_website: z.string().optional().default(""),
    message: z
      .string()
      .trim()
      .min(1, "Required")
      .max(2000, "Message must be 2000 characters or fewer"),
  })
  .superRefine((data, ctx) => {
    if (data.company_website && data.company_website.trim().length > 0) {
      ctx.addIssue({
        code: "custom",
        message: "Unable to submit enquiry",
        path: ["company_website"],
      });
    }
  });

export type PublicGarageEnquiryInput = z.infer<typeof publicGarageEnquirySchema>;
