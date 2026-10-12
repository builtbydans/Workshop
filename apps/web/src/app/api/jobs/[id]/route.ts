import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as jobService from "@/server/modules/job/job.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id } = await params;
    const job = await jobService.getJobById(id, auth.role, auth.employeeId);
    return json(200, job);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const job = await jobService.updateJobById(id, body);
    return json(200, job);
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const job = await jobService.deleteJobById(id);
    return json(200, job);
  });
}
