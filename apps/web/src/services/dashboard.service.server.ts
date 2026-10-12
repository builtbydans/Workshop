import "server-only";

import { requireServerAuth } from "@/lib/server-auth";
import * as dashboardService from "@/server/modules/dashboard/dashboard.service";

export async function getDashboardStats() {
  await requireServerAuth();
  return dashboardService.getDashboardStats();
}
