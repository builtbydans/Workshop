import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as jobService from "@/server/modules/job/job.service";
import { raiseToManagerSchema } from "@/server/schemas/job.schema";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id } = await params;
    const body = await parseBody(request, raiseToManagerSchema);
    await jobService.raiseToManager(
      id,
      body.note,
      auth.role,
      auth.employeeId,
    );
    const job = await jobService.getJobById(id, auth.role, auth.employeeId);
    return json(200, job);
  });
}
