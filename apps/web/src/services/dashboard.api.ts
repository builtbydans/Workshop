import type { ApiFetch } from "@/lib/api-types";
import type { WorkshopDashboardDto } from "@/types/dashboard.types";

export function createDashboardService(apiFetch: ApiFetch) {
  const getDashboardStats = () =>
    apiFetch<WorkshopDashboardDto>("/dashboard/stats", {
      method: "GET",
      cache: "no-store",
    });

  return { getDashboardStats };
}
