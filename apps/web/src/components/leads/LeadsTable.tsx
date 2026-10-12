"use client";

import { useState } from "react";
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

interface LeadsTableProps {
  leads: LeadSummaryDto[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredLeads =
    statusFilter === "ALL"
      ? leads
      : leads.filter((lead) => lead.status === statusFilter);

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="border-b p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "ALL" ? "default" : "outline"}
            onClick={() => setStatusFilter("ALL")}
          >
            All
          </Button>

          <Button
            variant={statusFilter === "LEAD" ? "default" : "outline"}
            onClick={() => setStatusFilter("LEAD")}
          >
            Leads
          </Button>

          <Button
            variant={statusFilter === "QUOTED" ? "default" : "outline"}
            onClick={() => setStatusFilter("QUOTED")}
          >
            Quoted
          </Button>

          <Button
            variant={statusFilter === "LOST" ? "default" : "outline"}
            onClick={() => setStatusFilter("LOST")}
          >
            Lost
          </Button>
        </div>
      </div>

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
          {filteredLeads.length === 0 ? (
            <TableRow>
              <TableCell className="h-32 text-center" colSpan={6}>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ClipboardList className="size-8" />
                  <p>No leads found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <p className="font-medium">{lead.job_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.job_type || "Customer enquiry"}
                  </p>
                </TableCell>

                <TableCell>
                  {lead.vehicles.customers.first_name}{" "}
                  {lead.vehicles.customers.last_name}
                </TableCell>

                <TableCell>
                  {lead.vehicles.make} {lead.vehicles.model}
                  <div className="text-xs text-muted-foreground">
                    {formatRegistration(lead.vehicles.registration)}
                  </div>
                </TableCell>

                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>

                <TableCell>
                  <span suppressHydrationWarning>
                    {formatRelativeDate(lead.created_at)}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/leads/${lead.id}`}>
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
