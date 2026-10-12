import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as leadService from "@/server/modules/lead/lead.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const lead = await leadService.acceptQuote(id);
    return json(200, lead);
  });
}
