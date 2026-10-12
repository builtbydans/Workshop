import { ReceiptText } from "lucide-react";

import InvoicesTable from "@/components/invoices/InvoicesTable";
import { getInvoices } from "@/services/invoice.service.server";

const InvoicePage = async () => {
  const invoices = await getInvoices();

  return (
    <main className="space-y-6 px-12 py-6">
      <div>
        <div className="flex items-center gap-2">
          <ReceiptText className="size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Draft, issue, settle and download customer invoices.
        </p>
      </div>

      <InvoicesTable invoices={invoices} />
    </main>
  );
};

export default InvoicePage;
