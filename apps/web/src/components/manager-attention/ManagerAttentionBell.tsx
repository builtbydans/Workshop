"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getOutstandingRaiseCount,
  getOutstandingRaises,
} from "@/services/manager-attention.service";
import type { DashboardRaiseDto } from "@/types/job-raise.types";
import { formatRelativeDate } from "@/utils/date";
import { formatRegistration } from "@/utils/formatRegistration";

const employeeName = (employee: { first_name: string; last_name: string }) =>
  `${employee.first_name} ${employee.last_name}`.trim();

const acknowledgementLabel = (raise: DashboardRaiseDto) =>
  raise.status === "ACKNOWLEDGED" || raise.acknowledged_at
    ? "Acknowledged"
    : "Needs acknowledgement";

export function ManagerAttentionBell() {
  const [count, setCount] = useState(0);
  const [raises, setRaises] = useState<DashboardRaiseDto[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [open, setOpen] = useState(false);
  const loadedOnceRef = useRef(false);

  const loadCount = useCallback(async () => {
    try {
      const next = await getOutstandingRaiseCount();
      setCount(next);
    } catch {
      setCount(0);
    }
  }, []);

  const loadRaises = useCallback(async () => {
    setLoadingList(true);

    try {
      const next = await getOutstandingRaises();
      setRaises(next);
      setCount(next.length);
    } catch {
      setRaises([]);
      setCount(0);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (loadedOnceRef.current) {
      return;
    }

    loadedOnceRef.current = true;
    void loadCount();
  }, [loadCount]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      void loadRaises();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={
            count > 0
              ? `Manager attention, ${count} outstanding`
              : "Manager attention"
          }
          className="relative"
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <Bell className="size-4" />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <DropdownMenuLabel className="px-4 py-3 text-sm font-semibold">
          Manager Attention
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {loadingList && raises === null ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Loading escalations…
            </p>
          ) : !raises || raises.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No outstanding raises right now.
            </p>
          ) : (
            raises.map((raise) => (
              <Link
                className="block border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-accent"
                href={`/jobs/${raise.job_id}`}
                key={raise.id}
                onClick={() => setOpen(false)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{raise.job_number}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {raise.vehicles
                        ? `${raise.vehicles.make} ${raise.vehicles.model} · ${formatRegistration(raise.vehicles.registration)}`
                        : "Vehicle unavailable"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeDate(raise.created_at)}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  Raised by {employeeName(raise.raised_by)}
                </p>
                {raise.latest_note && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {raise.latest_note}
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {acknowledgementLabel(raise)}
                </p>
              </Link>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button asChild className="w-full" size="sm" variant="outline">
            <Link href="/alerts" onClick={() => setOpen(false)}>
              View All
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
