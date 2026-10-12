import InvoiceDetails from "@/components/invoices/InvoiceDetails";
import { getInvoiceById } from "@/services/invoice.service.server";

const InvoiceDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  return <InvoiceDetails initialInvoice={invoice} />;
};

export default InvoiceDetailsPage;
