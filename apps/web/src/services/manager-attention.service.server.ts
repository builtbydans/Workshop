import "server-only";

import { requireServerAuth } from "@/lib/server-auth";
import * as jobRaiseService from "@/server/modules/job/raises/job-raise.service";

export async function getOutstandingRaises() {
  const auth = await requireServerAuth();
  return jobRaiseService.getOutstandingRaisesForManager(auth.role);
}
