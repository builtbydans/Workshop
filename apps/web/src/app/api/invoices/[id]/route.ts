import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as invoiceService from "@/server/modules/invoice/invoice.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id } = await params;
    const invoice = await invoiceService.getInvoiceById(id, auth.role);
    return json(200, invoice);
  });
}
