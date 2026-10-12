import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as jobService from "@/server/modules/job/job.service";
import { transitionJobSchema } from "@/server/schemas/job.schema";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id } = await params;
    const body = await parseBody(request, transitionJobSchema);
    const job = await jobService.transitionJob(id, {
      targetStatus: body.targetStatus,
      note: body.note,
      actorId: auth.userId,
      actorRole: auth.role,
      actorEmployeeId: auth.employeeId,
    });
    return json(200, job);
  });
}
