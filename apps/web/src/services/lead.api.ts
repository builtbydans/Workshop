import type { ApiFetch } from "@/lib/api-types";
import type {
  CreateLeadDto,
  LeadSummaryDto,
  QuoteLeadDto,
} from "@/types/lead.types";
import type { JobSummaryDto } from "@/types/job.types";

export function createLeadService(apiFetch: ApiFetch) {
  const createLead = (leadData: CreateLeadDto) =>
    apiFetch<LeadSummaryDto>("/leads", {
      method: "POST",
      body: JSON.stringify(leadData),
    });

  const getLeads = () =>
    apiFetch<LeadSummaryDto[]>("/leads", {
      method: "GET",
    });

  const getLeadById = (id: string) =>
    apiFetch<LeadSummaryDto>(`/leads/${id}`, {
      method: "GET",
    });

  const quoteLead = (id: string, quoteData: QuoteLeadDto) =>
    apiFetch<LeadSummaryDto>(`/leads/${id}/quote`, {
      method: "PATCH",
      body: JSON.stringify(quoteData),
    });

  const markLeadAsLost = (id: string) =>
    apiFetch<LeadSummaryDto>(`/leads/${id}/lost`, {
      method: "PATCH",
    });

  const acceptQuote = (id: string) =>
    apiFetch<LeadSummaryDto>(`/leads/${id}/accept`, {
      method: "PATCH",
    });

  const confirmDeposit = (id: string) =>
    apiFetch<JobSummaryDto>(`/jobs/${id}/confirm-deposit`, {
      method: "PATCH",
    });

  return {
    createLead,
    getLeads,
    getLeadById,
    quoteLead,
    markLeadAsLost,
    acceptQuote,
    confirmDeposit,
  };
}
