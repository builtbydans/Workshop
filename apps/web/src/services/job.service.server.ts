import "server-only";

import { requireServerAuth } from "@/lib/server-auth";
import * as jobService from "@/server/modules/job/job.service";
import type { TransitionJobDto } from "@/server/types/job.types";

export async function getJobs() {
  const auth = await requireServerAuth();
  return jobService.getJobs(auth.role, auth.employeeId);
}

export async function getJobById(id: string) {
  const auth = await requireServerAuth();
  return jobService.getJobById(id, auth.role, auth.employeeId);
}

export async function transitionJob(id: string, command: TransitionJobDto) {
  const auth = await requireServerAuth();
  return jobService.transitionJob(id, {
    ...command,
    actorId: auth.userId,
    actorRole: auth.role,
    actorEmployeeId: auth.employeeId,
  });
}
