import { apiFetch } from "@/lib/api";
import { createDashboardService } from "@/services/dashboard.api";

export const { getDashboardStats } = createDashboardService(apiFetch);
