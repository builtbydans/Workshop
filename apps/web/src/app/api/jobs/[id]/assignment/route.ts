import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as jobService from "@/server/modules/job/job.service";
import { assignTechnicianSchema } from "@/server/schemas/job.schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id } = await params;
    const body = await parseBody(request, assignTechnicianSchema);
    const job = await jobService.assignTechnician(
      id,
      body.technicianId ?? null,
      auth.role,
    );
    return json(200, job);
  });
}
