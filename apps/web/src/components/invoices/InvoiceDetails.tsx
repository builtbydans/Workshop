"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  LoaderCircle,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";

import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api-error";
import {
  downloadInvoicePdf,
  issueInvoice,
  markInvoicePaid,
  voidInvoice,
} from "@/services/invoice.service";
import type { InvoiceDto } from "@/types/invoice.types";
import { formatRegistration } from "@/utils/formatRegistration";

const COMPANY = {
  legalName: "Workshop Automotive Ltd",
  address: ["14 Foundry Lane", "Manchester", "M1 4AB"],
  email: "hello@workshop.example",
  phone: "0161 555 0142",
  vatNumber: "GB 123 4567 89",
};

const money = (value: number) =>
  `£${Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

const kind = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase();

type PendingAction = "issue" | "pay" | "void" | null;

const actionCopy = {
  issue: {
    title: "Issue this invoice?",
    description:
      "This turns the draft into an official unpaid invoice. Its snapshotted lines and totals cannot be edited afterwards.",
    button: "Issue as unpaid",
  },
  pay: {
    title: "Confirm the remaining balance was paid?",
    description:
      "This records the full invoice total as paid and locks the invoice as a receipt. Only continue after confirming payment was received.",
    button: "Mark paid",
  },
  void: {
    title: "Void this invoice?",
    description:
      "The invoice will remain in the audit trail but cannot be issued or paid. This action is for cancelled or incorrect invoices.",
    button: "Void invoice",
  },
} as const;

const InvoiceDetails = ({ initialInvoice }: { initialInvoice: InvoiceDto }) => {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = async () => {
    if (!pendingAction) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated =
        pendingAction === "issue"
          ? await issueInvoice(invoice.id)
          : pendingAction === "pay"
            ? await markInvoicePaid(invoice.id)
            : await voidInvoice(invoice.id);
      setInvoice(updated);
      setPendingAction(null);
      toast.success(
        pendingAction === "issue"
          ? "Invoice issued"
          : pendingAction === "pay"
            ? "Invoice marked paid"
            : "Invoice voided",
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update invoice"));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);

    try {
      await downloadInvoicePdf(invoice.id, invoice.invoice_number);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to download invoice"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="space-y-5 px-5 py-6 md:px-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost">
          <Link href="/invoices">
            <ArrowLeft />
            Back to invoices
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={downloading}
            onClick={() => void handleDownload()}
            type="button"
            variant="outline"
          >
            {downloading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Download />
            )}
            Download PDF
          </Button>
          {invoice.status === "DRAFT" && (
            <Button
              onClick={() => setPendingAction("issue")}
              type="button"
            >
              Issue invoice
            </Button>
          )}
          {invoice.status === "UNPAID" && (
            <Button onClick={() => setPendingAction("pay")} type="button">
              Mark paid
            </Button>
          )}
          {(invoice.status === "DRAFT" || invoice.status === "UNPAID") && (
            <Button
              onClick={() => setPendingAction("void")}
              type="button"
              variant="destructive"
            >
              Void
            </Button>
          )}
        </div>
      </div>

      {pendingAction && (
        <Alert variant={pendingAction === "void" ? "destructive" : "default"}>
          <AlertTriangle />
          <AlertTitle>{actionCopy[pendingAction].title}</AlertTitle>
          <AlertDescription>
            {actionCopy[pendingAction].description}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                disabled={saving}
                onClick={() => setPendingAction(null)}
                size="sm"
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                onClick={() => void runAction()}
                size="sm"
                type="button"
                variant={pendingAction === "void" ? "destructive" : "default"}
              >
                {saving && <LoaderCircle className="animate-spin" />}
                {actionCopy[pendingAction].button}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card className="mx-auto max-w-5xl overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b bg-muted/20 p-6 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
                    <ReceiptText className="size-5" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">Workshop</p>
                    <p className="text-xs tracking-[0.18em] text-muted-foreground">
                      AUTOMOTIVE CARE
                    </p>
                  </div>
                </div>
                <div className="mt-5 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {COMPANY.legalName}
                  </p>
                  {COMPANY.address.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p className="mt-2">{COMPANY.email}</p>
                  <p>{COMPANY.phone}</p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-3xl font-semibold tracking-tight">Invoice</p>
                <div className="mt-2 flex md:justify-end">
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <dl className="mt-5 grid grid-cols-[auto_auto] gap-x-5 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Invoice</dt>
                  <dd className="font-medium">{invoice.invoice_number}</dd>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{date(invoice.created_at)}</dd>
                  <dt className="text-muted-foreground">Issued</dt>
                  <dd>{date(invoice.issued_at)}</dd>
                  <dt className="text-muted-foreground">Due</dt>
                  <dd>{date(invoice.due_at)}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-6 md:p-10">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bill to
                </p>
                <p className="mt-2 font-semibold">{invoice.customer_name}</p>
                {invoice.customer_email && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer_email}
                  </p>
                )}
                {invoice.customer_phone && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer_phone}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Vehicle and job
                </p>
                <p className="mt-2 font-semibold">
                  {invoice.vehicle_make} {invoice.vehicle_model}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatRegistration(invoice.vehicle_registration)}
                </p>
                <Button asChild className="mt-2 px-0" variant="link">
                  <Link href={`/jobs/${invoice.job_id}`}>
                    {invoice.job_number}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-foreground text-left text-background">
                  <tr>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 text-right font-medium">Qty</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Unit price
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr className="border-t" key={line.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{line.description}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground">
                            {kind(line.kind)}
                          </span>
                          {line.origin === "ADDITIONAL" && (
                            <Badge variant="secondary">Additional work</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {line.quantity}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {money(line.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {money(line.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{money(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-{money(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  VAT ({invoice.vat_rate}%)
                </span>
                <span>{money(invoice.vat)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Invoice total</span>
                <span>{money(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-700 dark:text-emerald-400">
                <span>Deposit paid</span>
                <span>-{money(invoice.deposit_paid)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                <span>
                  {invoice.status === "PAID" ? "Amount paid" : "Balance due"}
                </span>
                <span>
                  {money(
                    invoice.status === "PAID"
                      ? invoice.amount_paid
                      : invoice.balance_due,
                  )}
                </span>
              </div>
            </div>

            <div className="border-t pt-5 text-xs text-muted-foreground">
              <p>
                VAT registration {COMPANY.vatNumber}. Payment is due on receipt;
                quote {invoice.invoice_number} with payment.
              </p>
              {invoice.status === "PAID" && (
                <p className="mt-2 font-medium text-emerald-700 dark:text-emerald-400">
                  Paid in full on {date(invoice.paid_at)}.
                </p>
              )}
              {invoice.status === "DRAFT" && (
                <p className="mt-2 font-medium">
                  Draft document — not yet issued to the customer.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default InvoiceDetails;
