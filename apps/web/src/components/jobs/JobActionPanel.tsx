"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { transitionJob } from "@/services/job.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  JOB_STATUS,
  JobStatus,
  formatJobStatus,
} from "@/constants/job-status";
import { JobActionDto, JobSummaryDto } from "@/types/job.types";
import { formatRelativeDate } from "@/utils/date";

const transitionCopy: Partial<
  Record<JobStatus, { label: string; description: string }>
> = {
  [JOB_STATUS.AWAITING_PARTS]: {
    label: "Mark as awaiting parts",
    description: "Pause workshop progress until the required parts arrive.",
  },
  [JOB_STATUS.IN_PROGRESS]: {
    label: "Start job",
    description: "Move the vehicle into active workshop work.",
  },
  [JOB_STATUS.AWAITING_REVIEW]: {
    label: "Send for review",
    description: "Work is ready for an internal review.",
  },
  [JOB_STATUS.FINAL_INSPECTION]: {
    label: "Begin final inspection",
    description: "Move the vehicle into its final quality inspection.",
  },
  [JOB_STATUS.READY_FOR_COLLECTION]: {
    label: "Ready for collection",
    description: "Confirm that the vehicle can be collected by the customer.",
  },
  [JOB_STATUS.INVOICED]: {
    label: "Mark invoiced",
    description: "The invoice has been created for this job.",
  },
  [JOB_STATUS.COMPLETED]: {
    label: "Complete job",
    description: "Close the workshop job after the invoice has been paid.",
  },
};

interface JobActionPanelProps {
  job: JobSummaryDto;
  onTransition?: (
    jobId: string,
    nextStatus: JobStatus,
    note?: string,
  ) => Promise<unknown>;
}

const JobActionPanel = ({ job, onTransition }: JobActionPanelProps) => {
  const router = useRouter();
  const allowedActions = job.allowedActions ?? [];
  const nextActions = allowedActions.filter((action) => !action.isOverride);
  const overrideActions = allowedActions.filter((action) => action.isOverride);

  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);
  const [warningForStatus, setWarningForStatus] = useState<JobStatus | null>(
    null,
  );
  const [noteForStatus, setNoteForStatus] = useState<JobStatus | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [overridesOpen, setOverridesOpen] = useState(nextActions.length === 0);

  const handleTransition = async (nextStatus: JobStatus, nextNote?: string) => {
    setPendingStatus(nextStatus);
    setError(null);

    try {
      if (onTransition) {
        await onTransition(job.id, nextStatus, nextNote);
      } else {
        await transitionJob(job.id, nextStatus, nextNote);
        router.refresh();
      }

      toast.success(`Job moved to ${formatJobStatus(nextStatus)}`);
      setNote("");
      setNoteForStatus(null);
      setWarningForStatus(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update job status"));
    } finally {
      setPendingStatus(null);
    }
  };

  const handleActionClick = (action: JobActionDto) => {
    setError(null);
    setNote("");

    if (action.isOverride) {
      setNoteForStatus(null);
      setWarningForStatus(action.targetStatus);
      setOverridesOpen(true);
      return;
    }

    setWarningForStatus(null);
    setNoteForStatus(action.targetStatus);
  };

  const handleWarningContinue = (status: JobStatus) => {
    setError(null);
    setNote("");
    setWarningForStatus(null);
    setNoteForStatus(status);
  };

  const handleNoteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!noteForStatus) {
      return;
    }

    const action = allowedActions.find(
      (item) => item.targetStatus === noteForStatus,
    );
    const trimmedNote = note.trim();

    if (action?.requiresReason && !trimmedNote) {
      setError("A reason is required for this action");
      return;
    }

    void handleTransition(noteForStatus, trimmedNote || undefined);
  };

  const clearActionForm = () => {
    setNoteForStatus(null);
    setWarningForStatus(null);
    setNote("");
    setError(null);
  };

  const renderAction = (action: JobActionDto) => {
    const copy = transitionCopy[action.targetStatus];
    const isPending = pendingStatus === action.targetStatus;
    const isCollectingNote = noteForStatus === action.targetStatus;
    const isShowingWarning = warningForStatus === action.targetStatus;
    const isOverride = Boolean(action.isOverride);

    return (
      <div
        className={cn(
          "rounded-lg border",
          isOverride && "border-destructive/40 bg-destructive/5",
        )}
        key={action.targetStatus}
      >
        <button
          className={cn(
            "group flex w-full items-center gap-4 p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            isOverride ? "hover:bg-destructive/10" : "hover:bg-muted/40",
          )}
          disabled={pendingStatus !== null}
          onClick={() => handleActionClick(action)}
          type="button"
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              isOverride
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary",
            )}
          >
            {isPending ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : isOverride ? (
              <AlertTriangle className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {copy?.label ?? formatJobStatus(action.targetStatus)}
              </p>
              {isOverride && (
                <Badge variant="destructive">Override</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {copy?.description ??
                `Move this job to ${formatJobStatus(action.targetStatus)}.`}
            </p>
          </div>
        </button>

        {isShowingWarning && (
          <div className="space-y-3 border-t border-destructive/30 p-4">
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>This override has a dangerous effect</AlertTitle>
              <AlertDescription>
                The job will jump to {formatJobStatus(action.targetStatus)} and
                skip the normal workshop path. That can leave work unfinished or
                confuse technicians on the floor. Only continue if you intend to
                take over this decision.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button
                disabled={pendingStatus !== null}
                onClick={clearActionForm}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                disabled={pendingStatus !== null}
                onClick={() => handleWarningContinue(action.targetStatus)}
                type="button"
                variant="destructive"
              >
                I understand, continue
              </Button>
            </div>
          </div>
        )}

        {isCollectingNote && (
          <form
            className="space-y-3 border-t p-4"
            onSubmit={handleNoteSubmit}
          >
            {isOverride && (
              <p className="text-sm text-destructive">
                A written reason is required before this override is applied.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor={`note-${action.targetStatus}`}>
                {action.requiresReason ? "Reason" : "Note"}
                {!action.requiresReason && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    (optional)
                  </span>
                )}
              </Label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                disabled={pendingStatus !== null}
                id={`note-${action.targetStatus}`}
                maxLength={500}
                onChange={(event) => setNote(event.target.value)}
                placeholder={
                  action.requiresReason
                    ? "Why is this override needed?"
                    : "Add a note for the next person, or leave blank."
                }
                required={action.requiresReason}
                value={note}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                disabled={pendingStatus !== null}
                onClick={clearActionForm}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                disabled={pendingStatus !== null}
                type="submit"
                variant={isOverride ? "destructive" : "default"}
              >
                {isPending && <LoaderCircle className="animate-spin" />}
                {isOverride ? "Override status" : "Confirm"}
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {job.canGenerateInvoice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">Awaiting invoice</p>
            <p className="mt-1 text-sm opacity-80">
              Create the invoice in the invoice panel. That moves this job to
              Invoiced.
            </p>
          </div>
        )}

        {job.status === JOB_STATUS.INVOICED &&
          !job.invoicePaid &&
          Boolean(job.invoice) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">Invoice unpaid</p>
            <p className="mt-1 text-sm opacity-80">
              Mark the invoice as paid before this job can be completed.
            </p>
          </div>
        )}

        {nextActions.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {nextActions.map(renderAction)}
          </div>
        )}

        {overrideActions.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-destructive/40">
            <button
              aria-expanded={overridesOpen}
              className="flex w-full items-center justify-between gap-3 bg-destructive/5 px-4 py-3 text-left text-destructive hover:bg-destructive/10"
              onClick={() => setOverridesOpen((open) => !open)}
              type="button"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4" />
                <span className="font-medium">Override actions</span>
                <Badge variant="destructive">{overrideActions.length}</Badge>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  overridesOpen && "rotate-180",
                )}
              />
            </button>
            {overridesOpen && (
              <div className="space-y-3 border-t border-destructive/30 bg-background p-3">
                <p className="text-sm text-muted-foreground">
                  These skip the normal workshop path. Use them only when you
                  need to take over a job.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {overrideActions.map(renderAction)}
                </div>
              </div>
            )}
          </div>
        )}

        {nextActions.length === 0 && overrideActions.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <div>
              <p className="font-medium">
                {job.status === JOB_STATUS.COMPLETED
                  ? "Workshop job completed"
                  : job.status === JOB_STATUS.READY_FOR_COLLECTION
                    ? job.canGenerateInvoice
                      ? "Awaiting invoice"
                      : "Waiting on a manager"
                    : job.status === JOB_STATUS.INVOICED
                      ? job.invoice
                        ? "Waiting for payment"
                        : "Waiting on a manager"
                      : job.status === JOB_STATUS.AWAITING_REVIEW ||
                          job.status === JOB_STATUS.FINAL_INSPECTION
                        ? "Waiting on a manager"
                        : "No workshop action available"}
              </p>
              <p className="text-sm text-muted-foreground">
                {job.canGenerateInvoice
                  ? "Create the invoice on this job to continue."
                  : job.status === JOB_STATUS.INVOICED && job.invoice
                    ? "Complete becomes available after the invoice is marked paid."
                    : job.status === JOB_STATUS.AWAITING_REVIEW ||
                        job.status === JOB_STATUS.READY_FOR_COLLECTION ||
                        job.status === JOB_STATUS.INVOICED
                      ? "A manager will finish billing and release the vehicle."
                      : `Last updated ${formatRelativeDate(job.updated_at)}.`}
              </p>
            </div>
          </div>
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

export default JobActionPanel;
