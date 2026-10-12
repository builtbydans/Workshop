import "server-only";

import { requireServerAuth } from "@/lib/server-auth";
import * as leadService from "@/server/modules/lead/lead.service";
import * as jobService from "@/server/modules/job/job.service";
import type { CreateLeadDto, QuoteLeadDto } from "@/types/lead.types";

export async function getLeads() {
  await requireServerAuth();
  return leadService.getLeads();
}

export async function getLeadById(id: string) {
  await requireServerAuth();
  return leadService.getLeadById(id);
}

export async function createLead(leadData: CreateLeadDto) {
  await requireServerAuth();
  return leadService.createLead(leadData);
}

export async function quoteLead(id: string, data: QuoteLeadDto) {
  await requireServerAuth();
  return leadService.quoteLead(id, data);
}

export async function markLeadAsLost(id: string) {
  await requireServerAuth();
  return leadService.markLeadAsLost(id);
}

export async function acceptQuote(id: string) {
  await requireServerAuth();
  return leadService.acceptQuote(id);
}

export async function confirmDeposit(jobId: string) {
  await requireServerAuth();
  return jobService.confirmDeposit(jobId);
}
