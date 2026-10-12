import Link from "next/link";

import StatusBadge from "@/components/StatusBadge";
import type { JobStatus } from "@/constants/job-status";
import type { DashboardRaiseDto } from "@/types/job-raise.types";
import { formatRelativeDate } from "@/utils/date";
import { formatRegistration } from "@/utils/formatRegistration";

export function AttentionRaisesList({
  raises,
  emptyLabel = "No open raises right now.",
}: {
  raises: DashboardRaiseDto[];
  emptyLabel?: string;
}) {
  if (raises.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {raises.map((raise) => (
        <Link
          className="block rounded-lg border border-red-200 bg-background p-4 transition-colors hover:border-red-400 dark:border-red-900 dark:hover:border-red-700"
          href={`/jobs/${raise.job_id}`}
          key={raise.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">
                {raise.raised_by.first_name} {raise.raised_by.last_name} has left
                a note
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {raise.job_number}
                {raise.vehicles
                  ? ` · ${formatRegistration(raise.vehicles.registration)}`
                  : ""}
              </p>
              <p className="mt-2 line-clamp-2 text-sm">{raise.latest_note}</p>
            </div>
            <StatusBadge status={raise.job_status as JobStatus} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatRelativeDate(raise.updated_at)}
          </p>
        </Link>
      ))}
    </div>
  );
}
