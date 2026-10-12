import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as leadService from "@/server/modules/lead/lead.service";
import { quoteLeadSchema } from "@/server/schemas/lead.schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const body = await parseBody(request, quoteLeadSchema);
    const lead = await leadService.quoteLead(id, body);
    return json(200, lead);
  });
}
