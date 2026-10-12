"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";

import { formatRelativeDate } from "@/utils/date";
import { formatRegistration } from "@/utils/formatRegistration";

import { JobSummaryDto } from "@/types/job.types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobsTableProps {
  jobs: JobSummaryDto[];
}

export function JobsTable({ jobs }: JobsTableProps) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredJobs =
    statusFilter === "ALL"
      ? jobs
      : jobs.filter((job) => job.status === statusFilter);

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
            variant={statusFilter === "BOOKED" ? "default" : "outline"}
            onClick={() => setStatusFilter("BOOKED")}
          >
            Booked
          </Button>

          <Button
            variant={statusFilter === "IN_PROGRESS" ? "default" : "outline"}
            onClick={() => setStatusFilter("IN_PROGRESS")}
          >
            In Progress
          </Button>

          <Button
            variant={statusFilter === "READY_FOR_COLLECTION" ? "default" : "outline"}
            onClick={() => setStatusFilter("READY_FOR_COLLECTION")}
          >
            Ready for collection
          </Button>

          <Button
            variant={statusFilter === "INVOICED" ? "default" : "outline"}
            onClick={() => setStatusFilter("INVOICED")}
          >
            Invoiced
          </Button>

          <Button
            variant={statusFilter === "COMPLETED" ? "default" : "outline"}
            onClick={() => setStatusFilter("COMPLETED")}
          >
            Completed
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
            <TableHead>Technician</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredJobs.length === 0 ? (
            <TableRow>
              <TableCell className="h-32 text-center" colSpan={7}>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Wrench className="size-8" />
                  <p>No jobs found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <p className="font-medium">{job.job_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.job_type || "Workshop job"}
                  </p>
                </TableCell>

                <TableCell>
                  {job.vehicles.customers.first_name}{" "}
                  {job.vehicles.customers.last_name}
                </TableCell>

                <TableCell>
                  {job.vehicles.make} {job.vehicles.model}
                  <div className="text-xs text-muted-foreground">
                    {formatRegistration(job.vehicles.registration)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={job.status} />
                    {job.openRaise && (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        Raised
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {job.assigned_technician
                    ? `${job.assigned_technician.first_name} ${job.assigned_technician.last_name}`
                    : "Unassigned"}
                </TableCell>

                <TableCell>
                  <span suppressHydrationWarning>
                    {formatRelativeDate(job.created_at)}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/jobs/${job.id}`}>
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
