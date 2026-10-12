import { Wrench } from "lucide-react";

import { getJobs } from "@/services/job.service.server";
import { JobsTable } from "@/components/jobs/JobsTable";

const JobsPage = async () => {
  const jobs = await getJobs();

  return (
    <main className="space-y-6 py-6 px-12">
      <div>
        <div className="flex items-center gap-2">
          <Wrench className="size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Track active workshop jobs and their current progress.
        </p>
      </div>

      <JobsTable jobs={jobs} />
    </main>
  );
};

export default JobsPage;
