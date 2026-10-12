import { handleRoute, json, parseBody } from "@/server/lib/http";
import {
  assertRateLimit,
  getClientIdentity,
} from "@/server/lib/rate-limit";
import * as leadService from "@/server/modules/lead/lead.service";
import { publicGarageEnquirySchema } from "@/server/schemas/demo-garage.schema";

/** Public demo endpoint — intentionally unauthenticated and narrowly scoped. */
export async function POST(request: Request) {
  return handleRoute(async () => {
    assertRateLimit(getClientIdentity(request), {
      key: "demo-garage-enquiry",
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });

    const body = await parseBody(request, publicGarageEnquirySchema);

    const lead = await leadService.createLead({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      registration: body.registration,
      make: body.make,
      model: body.model,
      message: body.message,
    });

    // Return only safe confirmation fields — never customer PII dumps.
    return json(201, {
      id: lead.id,
      job_number: lead.job_number ?? null,
      status: lead.status,
    });
  });
}
