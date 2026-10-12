export const INVOICE_STATUS = {
  DRAFT: "DRAFT",
  UNPAID: "UNPAID",
  PAID: "PAID",
  VOID: "VOID",
} as const;

export type InvoiceStatus =
  (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export interface InvoiceLineDto {
  id: string;
  source_work_item_id: string | null;
  kind: "LABOUR" | "PARTS" | "MATERIALS";
  origin: "QUOTED" | "ADDITIONAL";
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  sort_order: number;
}

export interface InvoiceDto {
  id: string;
  job_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  vat_rate: number;
  vat: number;
  total: number;
  deposit_paid: number;
  amount_paid: number;
  balance_due: number;
  created_at: string;
  updated_at: string;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  voided_at: string | null;
  job_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  vehicle_registration: string;
  vehicle_make: string;
  vehicle_model: string;
  lines: InvoiceLineDto[];
}
