import type { ApiFetch } from "@/lib/api-types";
import type { InvoiceDto } from "@/types/invoice.types";

export function createInvoiceService(apiFetch: ApiFetch) {
  const getInvoices = () =>
    apiFetch<InvoiceDto[]>("/invoices", {
      method: "GET",
      cache: "no-store",
    });

  const getInvoiceById = (id: string) =>
    apiFetch<InvoiceDto>(`/invoices/${id}`, {
      method: "GET",
      cache: "no-store",
    });

  const getInvoiceByJobId = (jobId: string) =>
    apiFetch<InvoiceDto | null>(`/invoices/job/${jobId}`, {
      method: "GET",
      cache: "no-store",
    });

  const generateDraft = (jobId: string) =>
    apiFetch<InvoiceDto>("/invoices", {
      method: "POST",
      body: JSON.stringify({ job_id: jobId }),
    });

  const issueInvoice = (id: string) =>
    apiFetch<InvoiceDto>(`/invoices/${id}/issue`, {
      method: "POST",
    });

  const markInvoicePaid = (id: string) =>
    apiFetch<InvoiceDto>(`/invoices/${id}/pay`, {
      method: "POST",
    });

  const voidInvoice = (id: string) =>
    apiFetch<InvoiceDto>(`/invoices/${id}/void`, {
      method: "POST",
    });

  return {
    getInvoices,
    getInvoiceById,
    getInvoiceByJobId,
    generateDraft,
    issueInvoice,
    markInvoicePaid,
    voidInvoice,
  };
}
