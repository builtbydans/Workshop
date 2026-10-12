import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as jobService from "@/server/modules/job/job.service";

type Params = { params: Promise<{ id: string; raiseId: string }> };

export async function POST(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id, raiseId } = await params;
    await jobService.acknowledgeRaise(
      id,
      raiseId,
      auth.role,
      auth.employeeId,
    );
    const job = await jobService.getJobById(id, auth.role, auth.employeeId);
    return json(200, job);
  });
}
