import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as jobService from "@/server/modules/job/job.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const job = await jobService.confirmDeposit(id);
    return json(200, job);
  });
}
