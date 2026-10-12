"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";

import { formatRelativeDate } from "@/utils/date";
import { formatRegistration } from "@/utils/formatRegistration";

import { LeadSummaryDto } from "@/types/lead.types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLeads } from "@/services/lead.service";

const leads: LeadSummaryDto[] | null = await getLeads();

export default function QuotesTable() {
  if (!leads || leads.length === 0) {
    return <div>There are no live quotes at this time</div>;
  }

  const quotes = leads.filter((lead) => lead.status === "QUOTED");
  const totalRev = quotes.reduce(
    (acc, curr) => acc + (curr.quoted_cost || 0),
    0,
  );

  return (
    <div className="m-5 overflow-hidden rounded-xl border">
      <h1>Total Potential Revenue: £{totalRev}.00</h1>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Job Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell className="h-32 text-center" colSpan={6}>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ClipboardList className="size-8" />
                  <p>No active quotes found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>
                  <p className="font-medium">{quote.job_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {quote.job_type || "Customer enquiry"}
                  </p>
                </TableCell>

                <TableCell>
                  {quote.vehicles.customers.first_name}{" "}
                  {quote.vehicles.customers.last_name}
                </TableCell>

                <TableCell>
                  {quote.vehicles.make} {quote.vehicles.model}
                  <div className="text-xs text-muted-foreground">
                    {formatRegistration(quote.vehicles.registration)}
                  </div>
                </TableCell>

                <TableCell>
                  <StatusBadge status={quote.status} />
                </TableCell>

                <TableCell>£{quote.quoted_cost}.00</TableCell>

                <TableCell>
                  <span suppressHydrationWarning>
                    {formatRelativeDate(quote.created_at)}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/quotes/${quote.id}`}>
                      View
                      <ArrowRight data-icon="inline-end" />
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
}
