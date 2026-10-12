import { apiFetch } from "@/lib/api";
import { createLeadService } from "@/services/lead.api";

export const {
  createLead,
  getLeads,
  getLeadById,
  quoteLead,
  markLeadAsLost,
  acceptQuote,
  confirmDeposit,
} = createLeadService(apiFetch);
