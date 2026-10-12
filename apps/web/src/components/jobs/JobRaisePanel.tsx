"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import {
  acknowledgeRaise,
  raiseToManager,
  resolveRaise,
} from "@/services/job.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { JobRaiseDto } from "@/types/job-raise.types";
import type { JobSummaryDto } from "@/types/job.types";
import { formatRelativeDate } from "@/utils/date";

const employeeName = (employee: {
  first_name: string;
  last_name: string;
}) => `${employee.first_name} ${employee.last_name}`.trim();

const RaiseThread = ({ raise }: { raise: JobRaiseDto }) => (
  <div className="space-y-3">
    {raise.notes.map((note) => (
      <div className="rounded-lg border bg-muted/40 p-3" key={note.id}>
        <p className="whitespace-pre-wrap text-sm">{note.body}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {employeeName(note.employee)} · {formatRelativeDate(note.created_at)}
        </p>
      </div>
    ))}
  </div>
);

interface JobRaisePanelProps {
  job: JobSummaryDto;
  variant: "technician" | "manager";
  onRaise?: (jobId: string, note: string) => Promise<JobSummaryDto>;
  onUpdated?: (job: JobSummaryDto) => void;
}

const JobRaisePanel = ({
  job,
  variant,
  onRaise,
  onUpdated,
}: JobRaisePanelProps) => {
  const router = useRouter();
  const raise = job.openRaise ?? null;
  const [note, setNote] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyUpdate = (updated: JobSummaryDto) => {
    if (onUpdated) {
      onUpdated(updated);
      return;
    }

    router.refresh();
  };

  const handleRaise = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = note.trim();

    if (!trimmed) {
      setError("A note is required so the manager knows what to look at");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const updated = await (onRaise
        ? onRaise(job.id, trimmed)
        : raiseToManager(job.id, trimmed));
      setNote("");
      setOpenForm(false);
      toast.success("Manager will see this on their dashboard");
      applyUpdate(updated);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to raise this job"));
    } finally {
      setPending(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!raise) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const updated = await acknowledgeRaise(job.id, raise.id);
      toast.success("Raise acknowledged");
      applyUpdate(updated);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to acknowledge this raise"));
    } finally {
      setPending(false);
    }
  };

  const handleResolve = async () => {
    if (!raise) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const updated = await resolveRaise(job.id, raise.id);
      toast.success("Raise resolved");
      applyUpdate(updated);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to resolve this raise"));
    } finally {
      setPending(false);
    }
  };

  if (variant === "technician" && !job.canRaiseToManager && !raise) {
    return null;
  }

  if (variant === "manager" && !raise) {
    return null;
  }

  return (
    <Card className={raise ? "border-amber-300 dark:border-amber-800" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareWarning className="size-4" />
          {raise
            ? `${employeeName(raise.raised_by)} has left a note`
            : "Raise to manager"}
          {raise && <Badge variant="outline">Needs manager</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {raise ? (
          <>
            <p className="text-sm text-muted-foreground">
              This does not stop the job. A manager still needs to look at it.
            </p>
            <RaiseThread raise={raise} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Use this when you need a decision. It will not change the job
            status. For anything urgent, still go and find a manager.
          </p>
        )}

        {variant === "technician" && job.canRaiseToManager && (
          <>
            {openForm || !raise ? (
              <form className="space-y-3" onSubmit={handleRaise}>
                <div className="space-y-2">
                  <Label htmlFor="raise-note">
                    {raise ? "Add another note" : "What should the manager know?"}
                  </Label>
                  <textarea
                    className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    disabled={pending}
                    id="raise-note"
                    maxLength={500}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Wrong part arrived, extra work found, need a manager to complete or skip a stage…"
                    required
                    value={note}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {raise && (
                    <Button
                      disabled={pending}
                      onClick={() => {
                        setOpenForm(false);
                        setNote("");
                        setError(null);
                      }}
                      type="button"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button disabled={pending} type="submit">
                    {pending && <LoaderCircle className="animate-spin" />}
                    {raise ? "Add note" : "Raise to manager"}
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                disabled={pending}
                onClick={() => {
                  setOpenForm(true);
                  setError(null);
                }}
                type="button"
                variant="outline"
              >
                Add another note
              </Button>
            )}
          </>
        )}

        {variant === "manager" && raise && (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              disabled={pending}
              onClick={() => void handleAcknowledge()}
              type="button"
              variant="outline"
            >
              {pending && <LoaderCircle className="animate-spin" />}
              Acknowledge
            </Button>
            <Button
              disabled={pending}
              onClick={() => void handleResolve()}
              type="button"
            >
              Mark resolved
            </Button>
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

export default JobRaisePanel;
