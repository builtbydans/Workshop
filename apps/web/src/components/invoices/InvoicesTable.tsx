"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";

import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceDto, InvoiceStatus } from "@/types/invoice.types";
import { formatRegistration } from "@/utils/formatRegistration";

const money = (value: number) =>
  `£${Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const date = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "Not issued";

const isOverdue = (invoice: InvoiceDto) => {
  if (invoice.status !== "UNPAID" || !invoice.due_at) {
    return false;
  }

  const due = new Date(invoice.due_at);
  due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now();
};

const InvoicesTable = ({ invoices }: { invoices: InvoiceDto[] }) => {
  const [status, setStatus] = useState<InvoiceStatus | "ALL">("ALL");
  const [period, setPeriod] = useState<"ALL" | "30_DAYS" | "OVERDUE">("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      if (status !== "ALL" && invoice.status !== status) {
        return false;
      }

      if (
        period === "30_DAYS" &&
        Date.now() - new Date(invoice.created_at).getTime() >
          30 * 24 * 60 * 60 * 1000
      ) {
        return false;
      }

      if (period === "OVERDUE" && !isOverdue(invoice)) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [
        invoice.invoice_number,
        invoice.job_number,
        invoice.customer_name,
        invoice.vehicle_registration,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [invoices, period, query, status]);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
        <Input
          className="sm:max-w-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search customer, vehicle, job or invoice"
          value={query}
        />
        <Select
          onValueChange={(value) => setStatus(value as InvoiceStatus | "ALL")}
          value={status}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="VOID">Void</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            setPeriod(value as "ALL" | "30_DAYS" | "OVERDUE")
          }
          value={period}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All dates</SelectItem>
            <SelectItem value="30_DAYS">Last 30 days</SelectItem>
            <SelectItem value="OVERDUE">Overdue only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Issued / due</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell className="h-40 text-center" colSpan={8}>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ReceiptText className="size-8" />
                  <p>No invoices match these filters.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.job_number}
                  </p>
                </TableCell>
                <TableCell>{invoice.customer_name}</TableCell>
                <TableCell>
                  <p>
                    {invoice.vehicle_make} {invoice.vehicle_model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRegistration(invoice.vehicle_registration)}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <InvoiceStatusBadge status={invoice.status} />
                    {isOverdue(invoice) && (
                      <span className="text-xs font-medium text-destructive">
                        Overdue
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p>{date(invoice.issued_at)}</p>
                  {invoice.due_at && (
                    <p className="text-xs text-muted-foreground">
                      Due {date(invoice.due_at)}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(invoice.total)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(invoice.balance_due)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/invoices/${invoice.id}`}>
                      View
                      <ArrowRight />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoicesTable;
