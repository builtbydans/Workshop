import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as invoiceService from "@/server/modules/invoice/invoice.service";
import { generateInvoiceSchema } from "@/server/schemas/invoice.schema";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const invoices = await invoiceService.getInvoices(auth.role);
    return json(200, invoices);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const body = await parseBody(request, generateInvoiceSchema);
    const invoice = await invoiceService.generateDraft(
      body,
      auth.role,
      auth.userId,
    );
    return json(201, invoice);
  });
}
