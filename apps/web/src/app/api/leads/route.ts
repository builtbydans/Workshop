import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as leadService from "@/server/modules/lead/lead.service";
import { createLeadSchema } from "@/server/schemas/lead.schema";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const leads = await leadService.getLeads();
    return json(200, leads);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const body = await parseBody(request, createLeadSchema);
    const lead = await leadService.createLead(body);
    return json(201, lead);
  });
}
