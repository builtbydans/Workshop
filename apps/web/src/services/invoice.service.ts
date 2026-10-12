import { API_URL } from "@/config/api";
import { ApiError } from "@/lib/api-error";
import { apiFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { createInvoiceService } from "@/services/invoice.api";

export const {
  getInvoices,
  getInvoiceById,
  getInvoiceByJobId,
  generateDraft,
  issueInvoice,
  markInvoicePaid,
  voidInvoice,
} = createInvoiceService(apiFetch);

export const downloadInvoicePdf = async (
  invoiceId: string,
  invoiceNumber: string,
) => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const response = await fetch(`${API_URL}/invoices/${invoiceId}/pdf`, {
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  });

  if (!response.ok) {
    let message = "Unable to download invoice PDF";

    try {
      const payload = await response.json();
      if (typeof payload?.message === "string") {
        message = payload.message;
      }
    } catch {
      // The PDF endpoint may return a non-JSON infrastructure error.
    }

    throw new ApiError(message, response.status, "INTERNAL_SERVER_ERROR");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${invoiceNumber}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
