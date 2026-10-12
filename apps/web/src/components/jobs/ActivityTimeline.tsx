import { ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { JobSummaryDto } from "@/types/job.types";
import { formatRelativeDate } from "@/utils/date";

interface ActivityTimelineProps {
  job: JobSummaryDto;
}

const ActivityTimeline = ({ job }: ActivityTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>

      <CardContent>
        {job.updates && job.updates.length > 0 ? (
          <div className="flow-root">
            {job.updates.map((update, index) => {
              const isLatest = index === 0;
              const isLast = index === job.updates.length - 1;
              const isBilling = update.kind === "BILLING";

              return (
                <div
                  key={update.id}
                  className={cn(
                    "grid grid-cols-[1.5rem_1fr] gap-3",
                    !isLast && "pb-6",
                  )}
                >
                  <div className="relative flex justify-center">
                    {!isLast && (
                      <div
                        className={cn(
                          "absolute top-4 bottom-[-1.5rem] w-px bg-border",
                          isLatest && "bg-primary/40",
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        "relative z-10 mt-1 flex size-4 items-center justify-center rounded-full border-2 bg-background",
                        isBilling
                          ? "border-emerald-500 ring-4 ring-emerald-500/10"
                          : isLatest
                            ? "border-primary ring-4 ring-primary/10"
                            : "border-muted-foreground/40",
                      )}
                    >
                      {isBilling ? (
                        <ReceiptText className="size-2.5 text-emerald-600" />
                      ) : (
                        <div
                          className={cn(
                            "size-1.5 rounded-full",
                            isLatest ? "bg-primary" : "bg-muted-foreground/60",
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "min-w-0 rounded-lg border bg-background p-3",
                      isBilling
                        ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"
                        : isLatest
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/70 text-muted-foreground",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={
                          isLatest || isBilling
                            ? "font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {update.message}
                      </p>
                      {isBilling && (
                        <Badge variant="secondary">Billing</Badge>
                      )}
                    </div>

                    {update.note && (
                      <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted/60 px-3 py-2 text-sm text-foreground">
                        {update.note}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatRelativeDate(update.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No activity recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
