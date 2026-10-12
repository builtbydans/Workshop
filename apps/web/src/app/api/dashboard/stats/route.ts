import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as dashboardService from "@/server/modules/dashboard/dashboard.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const stats = await dashboardService.getDashboardStats();
    return json(200, stats);
  });
}
