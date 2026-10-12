"use client";

import {
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Mail,
  Phone,
  UserRound,
  Wrench,
} from "lucide-react";

import StatusBadge from "@/components/StatusBadge";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import JobInvoicePanel from "@/components/invoices/JobInvoicePanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  JOB_STATUS,
  JobStatus,
  WORKSHOP_STATUS_SEQUENCE,
  formatJobStatus,
} from "@/constants/job-status";
import { cn } from "@/lib/utils";
import { JobSummaryDto } from "@/types/job.types";
import { EmployeeDto } from "@/types/employee.types";
import { formatRelativeDate } from "@/utils/date";
import { formatRegistration } from "@/utils/formatRegistration";

import ActivityTimeline from "./ActivityTimeline";
import AssignmentPanel from "./AssignmentPanel";
import JobActionPanel from "./JobActionPanel";
import JobRaisePanel from "./JobRaisePanel";
import WorkItemsPanel from "./WorkItemsPanel";

interface JobDetailsProps {
  job: JobSummaryDto;
  technicians?: EmployeeDto[];
}

const workshopIndexOf = (status: JobStatus) =>
  (WORKSHOP_STATUS_SEQUENCE as readonly JobStatus[]).indexOf(status);

const getWorkshopProgress = (status: JobStatus) => {
  if (status === JOB_STATUS.AWAITING_PARTS) {
    return workshopIndexOf(JOB_STATUS.BOOKED);
  }

  return workshopIndexOf(status);
};

const JobDetailsCard = ({ job, technicians = [] }: JobDetailsProps) => {
  const progressIndex = getWorkshopProgress(job.status);
  const isWorkshopJob = progressIndex >= 0;

  return (
    <div className="grid gap-6 px-15 py-5 xl:grid-cols-[minmax(0)_22rem]">
      <main className="min-w-0 space-y-6">
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/35 px-6 py-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={job.status} />
                  {job.invoice && (
                    <InvoiceStatusBadge status={job.invoice.status} />
                  )}
                  {job.openRaise && (
                    <Badge variant="outline">Needs manager</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {job.job_number}
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {job.job_type || "Workshop job"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatRegistration(job.vehicles.registration)} ·{" "}
                    {job.vehicles.make} {job.vehicles.model}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4" />
                Updated {formatRelativeDate(job.updated_at)}
              </div>
            </div>
          </div>

          {isWorkshopJob && (
            <CardContent className="px-6 py-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Workshop progress</p>
                <p className="text-xs text-muted-foreground">
                  {Math.max(progressIndex + 1, 1)} of{" "}
                  {WORKSHOP_STATUS_SEQUENCE.length} stages
                </p>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="flex min-w-[64rem] items-start">
                  {WORKSHOP_STATUS_SEQUENCE.map((status, index) => {
                    const isCurrent = status === job.status;
                    const isComplete = index < progressIndex;
                    const isFinalCompleted =
                      status === JOB_STATUS.COMPLETED &&
                      job.status === JOB_STATUS.COMPLETED;

                    return (
                      <div
                        className="mt-3 flex flex-1 items-start last:flex-none"
                        key={status}
                      >
                        <div className="flex w-24 flex-col items-center text-center">
                          <div
                            className={cn(
                              "flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground",
                              isComplete &&
                                "border-primary bg-primary text-primary-foreground",
                              isCurrent &&
                                "border-primary ring-4 ring-primary/10 text-primary",
                              isFinalCompleted &&
                                "border-green-500 bg-green-100 text-green-700 ring-4 ring-green-500/20",
                            )}
                          >
                            {isComplete || isFinalCompleted ? (
                              <Check className="size-4" />
                            ) : (
                              <span className="text-xs font-semibold">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <span
                            className={cn(
                              "mt-2 text-[11px] leading-tight text-muted-foreground",
                              isCurrent && "font-semibold text-foreground",
                            )}
                          >
                            {formatJobStatus(status)}
                          </span>
                        </div>

                        {index < WORKSHOP_STATUS_SEQUENCE.length - 1 && (
                          <div
                            className={cn(
                              "mt-4 h-px min-w-4 flex-1 bg-border",
                              isComplete && "bg-primary",
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">
                  {job.vehicles.customers.first_name}{" "}
                  {job.vehicles.customers.last_name}
                </p>
                <p className="text-sm text-muted-foreground">Vehicle owner</p>
              </div>
              <div className="grid gap-2 text-sm">
                <a
                  className="flex items-center gap-2 hover:underline"
                  href={`mailto:${job.vehicles.customers.email}`}
                >
                  <Mail className="size-4 text-muted-foreground" />
                  {job.vehicles.customers.email}
                </a>
                <a
                  className="flex items-center gap-2 hover:underline"
                  href={`tel:${job.vehicles.customers.phone}`}
                >
                  <Phone className="size-4 text-muted-foreground" />
                  {job.vehicles.customers.phone}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CarFront className="size-4 text-muted-foreground" />
                Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">
                  {job.vehicles.make} {job.vehicles.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  Customer vehicle
                </p>
              </div>
              <div className="inline-flex rounded-md border bg-yellow-300 dark:text-black px-3 py-1.5 font-mono text-sm font-bold tracking-wider">
                {formatRegistration(job.vehicles.registration)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4 text-muted-foreground" />
                Job information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Job type
                </p>
                <p className="mt-1 text-sm font-medium">
                  {job.job_type || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <CalendarDays className="size-3.5" />
                  {formatRelativeDate(job.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quoted cost
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <CircleDollarSign className="size-3.5" />£
                  {Number(job.quoted_cost ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actual cost
                </p>
                <p className="mt-1 text-sm font-medium">
                  {job.costs
                    ? `£${Number(job.costs.actual).toFixed(2)}`
                    : job.actual_cost
                      ? `£${Number(job.actual_cost).toFixed(2)}`
                      : "Not recorded"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="size-4 text-muted-foreground" />
                Job description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {job.description || "No job description has been added."}
              </p>
            </CardContent>
          </Card>
        </div>

        <WorkItemsPanel job={job} />
        <JobActionPanel job={job} />
      </main>

      <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
        <JobInvoicePanel job={job} />
        <JobRaisePanel job={job} variant="manager" />
        {technicians.length > 0 && (
          <AssignmentPanel job={job} technicians={technicians} />
        )}
        <ActivityTimeline job={job} />

        {job.status === JOB_STATUS.COMPLETED && (
          <Card className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
            <CardContent className="flex gap-3 p-5">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">Work completed</p>
                <p className="mt-1 text-sm opacity-75">
                  Completed {formatRelativeDate(job.updated_at)}.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
};

export default JobDetailsCard;
