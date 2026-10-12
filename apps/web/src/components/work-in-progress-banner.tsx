import { AlertTriangle } from "lucide-react";

export function WorkInProgressBanner() {
  return (
    <div className="flex min-h-10 items-center border-b border-amber-200 bg-amber-50 px-4 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 lg:px-6">
      <div className="flex w-full items-center gap-2 text-sm font-medium">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        <p>
          This project is a work in development. Features, data, and workflows
          may change as the system evolves.
        </p>
      </div>
    </div>
  );
}
