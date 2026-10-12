import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as jobService from "@/server/modules/job/job.service";
import { updateWorkItemSchema } from "@/server/schemas/job.schema";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id, itemId } = await params;
    const body = await parseBody(request, updateWorkItemSchema);
    const job = await jobService.updateWorkItem(
      id,
      itemId,
      body,
      auth.role,
      auth.employeeId,
    );
    return json(200, job);
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id, itemId } = await params;
    const job = await jobService.deleteWorkItem(
      id,
      itemId,
      auth.role,
      auth.employeeId,
    );
    return json(200, job);
  });
}
