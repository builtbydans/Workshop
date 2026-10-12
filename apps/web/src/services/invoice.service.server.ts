import "server-only";

import { requireServerAuth } from "@/lib/server-auth";
import * as invoiceService from "@/server/modules/invoice/invoice.service";

export async function getInvoices() {
  const auth = await requireServerAuth();
  return invoiceService.getInvoices(auth.role);
}

export async function getInvoiceById(id: string) {
  const auth = await requireServerAuth();
  return invoiceService.getInvoiceById(id, auth.role);
}

export async function getInvoiceByJobId(jobId: string) {
  const auth = await requireServerAuth();
  return invoiceService.getInvoiceByJobId(jobId, auth.role);
}
