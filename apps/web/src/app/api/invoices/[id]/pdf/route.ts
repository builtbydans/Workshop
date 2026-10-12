import { NextResponse } from "next/server";
import { requireAuth } from "@/server/lib/auth";
import { handleRoute } from "@/server/lib/http";
import * as invoiceService from "@/server/modules/invoice/invoice.service";
import * as invoicePdfService from "@/server/modules/invoice/invoice-pdf.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const { id } = await params;
    const invoice = await invoiceService.getInvoiceById(id, auth.role);
    const pdf = await invoicePdfService.drawInvoicePdf(invoice);
    const filename = `${invoice.invoice_number || "invoice"}.pdf`.replace(
      /[^a-zA-Z0-9._-]/g,
      "-",
    );

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.length),
      },
    });
  });
}
