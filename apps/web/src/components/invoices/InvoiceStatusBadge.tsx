import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/types/invoice.types";

const labels: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  UNPAID: "Unpaid",
  PAID: "Paid",
  VOID: "Void",
};

const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <Badge
    className={
      status === "PAID"
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        : status === "UNPAID"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          : undefined
    }
    variant={
      status === "VOID"
        ? "destructive"
        : status === "DRAFT"
          ? "outline"
          : "secondary"
    }
  >
    {labels[status]}
  </Badge>
);

export default InvoiceStatusBadge;
