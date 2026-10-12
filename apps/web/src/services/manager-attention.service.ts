import { apiFetch } from "@/lib/api";
import { createManagerAttentionService } from "@/services/manager-attention.api";

export const { getOutstandingRaises, getOutstandingRaiseCount } =
  createManagerAttentionService(apiFetch);
