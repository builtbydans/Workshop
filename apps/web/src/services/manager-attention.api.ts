import type { ApiFetch } from "@/lib/api-types";
import type { DashboardRaiseDto } from "@/types/job-raise.types";

export function createManagerAttentionService(apiFetch: ApiFetch) {
  const getOutstandingRaises = () =>
    apiFetch<DashboardRaiseDto[]>("/manager-attention", {
      method: "GET",
      cache: "no-store",
    });

  const getOutstandingRaiseCount = () =>
    apiFetch<{ count: number }>("/manager-attention?count=1", {
      method: "GET",
      cache: "no-store",
    }).then((data) => data.count);

  return { getOutstandingRaises, getOutstandingRaiseCount };
}
