"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JOB_STATUS } from "@/constants/job-status";
import { getErrorMessage } from "@/lib/api-error";
import { generateDraft, issueInvoice } from "@/services/invoice.service";
import type { JobSummaryDto } from "@/types/job.types";

const money = (value: number) =>
  `£${Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const JobInvoicePanel = ({ job }: { job: JobSummaryDto }) => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canOpenInvoice =
    job.status === JOB_STATUS.READY_FOR_COLLECTION ||
    job.status === JOB_STATUS.INVOICED ||
    job.status === JOB_STATUS.COMPLETED;

  const handleCreate = async () => {
    setCreating(true);
    setError(null);

    try {
      const invoice = await generateDraft(job.id);

      if (invoice.status === "DRAFT") {
        await issueInvoice(invoice.id);
      }

      toast.success("Invoice created");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create invoice"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptText className="size-4 text-muted-foreground" />
          Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {job.invoice && job.invoice.status !== "VOID" ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{job.invoice.invoice_number}</p>
                <p className="text-sm text-muted-foreground">
                  {job.invoice.status === "PAID"
                    ? `${money(job.invoice.amount_paid)} paid. The job can now be completed.`
                    : `${money(job.invoice.balance_due)} still due`}
                </p>
              </div>
              <InvoiceStatusBadge status={job.invoice.status} />
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link href={`/invoices/${job.invoice.id}`}>
                View invoice
                <ArrowRight />
              </Link>
            </Button>
          </>
        ) : job.canGenerateInvoice ? (
          <>
            <p className="text-sm text-muted-foreground">
              Snapshot the locked labour, parts and materials. Creating the
              invoice moves this job to Invoiced.
            </p>
            <Button
              className="w-full"
              disabled={creating}
              onClick={() => void handleCreate()}
              type="button"
            >
              {creating ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <ReceiptText />
              )}
              Create invoice
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {canOpenInvoice
              ? "Add work items before creating the invoice."
              : "Invoice creation opens after the job is marked ready for collection."}
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default JobInvoicePanel;
