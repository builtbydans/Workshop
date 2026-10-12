import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as jobService from "@/server/modules/job/job.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const jobs = await jobService.getJobs(auth.role, auth.employeeId);
    return json(200, jobs);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const body = await request.json();
    const job = await jobService.createJob(body);
    return json(201, job);
  });
}
