"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut, Wrench } from "lucide-react";
import { toast } from "sonner";

import ActivityTimeline from "@/components/jobs/ActivityTimeline";
import JobActionPanel from "@/components/jobs/JobActionPanel";
import JobRaisePanel from "@/components/jobs/JobRaisePanel";
import WorkItemsPanel from "@/components/jobs/WorkItemsPanel";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api-error";
import {
  clearWorkshopSession,
  getWorkshopSession,
  type WorkshopSession,
} from "@/lib/workshop-session";
import {
  getWorkshopJobById,
  getWorkshopJobs,
  raiseWorkshopJob,
  transitionWorkshopJob,
  createWorkshopWorkItem,
  deleteWorkshopWorkItem,
} from "@/services/workshop.api";
import type { JobSummaryDto } from "@/types/job.types";
import { formatRegistration } from "@/utils/formatRegistration";

const TechnicianFloorPage = () => {
  const router = useRouter();
  const [session, setSession] = useState<WorkshopSession | null>(null);
  const [jobs, setJobs] = useState<JobSummaryDto[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingJob, setLoadingJob] = useState(false);

  useEffect(() => {
    const current = getWorkshopSession();

    if (!current) {
      router.replace("/technician/login");
      return;
    }

    setSession(current);

    const loadJobs = async () => {
      try {
        setJobs(await getWorkshopJobs());
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load your jobs"));
      } finally {
        setLoading(false);
      }
    };

    void loadJobs();
  }, [router]);

  const openJob = async (jobId: string) => {
    setLoadingJob(true);

    try {
      setSelectedJob(await getWorkshopJobById(jobId));
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to open this job"));
    } finally {
      setLoadingJob(false);
    }
  };

  const handleClockOut = () => {
    clearWorkshopSession();
    router.replace("/technician/login");
  };

  if (!session || loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-muted p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-2xl border bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clocked in</p>
              <p className="text-lg font-semibold">
                {session.employee.first_name} {session.employee.last_name}
              </p>
            </div>
          </div>
          <Button onClick={handleClockOut} type="button" variant="outline">
            <LogOut className="size-4" />
            Clock out
          </Button>
        </header>

        {loadingJob ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <LoaderCircle className="size-6 animate-spin" />
          </div>
        ) : selectedJob ? (
          <div className="space-y-4">
            <Button
              onClick={() => setSelectedJob(null)}
              type="button"
              variant="ghost"
            >
              Back to my jobs
            </Button>
            <Card>
              <CardContent className="space-y-3 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedJob.status} />
                  {selectedJob.openRaise && (
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Raised to manager
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-semibold">
                  {selectedJob.job_number}
                </h1>
                <p className="text-muted-foreground">
                  {formatRegistration(selectedJob.vehicles.registration)} ·{" "}
                  {selectedJob.vehicles.make} {selectedJob.vehicles.model}
                </p>
                <p>{selectedJob.description || "No extra notes on this job."}</p>
              </CardContent>
            </Card>
            <WorkItemsPanel
              job={selectedJob}
              onCreate={createWorkshopWorkItem}
              onDelete={deleteWorkshopWorkItem}
              onUpdated={(updated) => {
                setJobs((current) =>
                  current.map((job) => (job.id === updated.id ? updated : job)),
                );
                setSelectedJob(updated);
              }}
            />
            <JobActionPanel
              job={selectedJob}
              onTransition={async (jobId, status, note) => {
                const updated = await transitionWorkshopJob(
                  jobId,
                  status,
                  note,
                );
                setJobs((current) =>
                  current.map((job) => (job.id === updated.id ? updated : job)),
                );
                setSelectedJob(updated);
              }}
            />
            <JobRaisePanel
              job={selectedJob}
              onRaise={raiseWorkshopJob}
              onUpdated={(updated) => {
                setJobs((current) =>
                  current.map((job) => (job.id === updated.id ? updated : job)),
                );
                setSelectedJob(updated);
              }}
              variant="technician"
            />
            <ActivityTimeline job={selectedJob} />
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Your jobs</h1>
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nothing assigned to you yet. Ask a manager to put a job on
                  your name.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {jobs.map((job) => (
                  <button
                    className="rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary"
                    key={job.id}
                    onClick={() => void openJob(job.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{job.job_number}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatRegistration(job.vehicles.registration)} ·{" "}
                          {job.vehicles.make} {job.vehicles.model}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={job.status} />
                        {job.openRaise && (
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                            Raised to manager
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianFloorPage;
