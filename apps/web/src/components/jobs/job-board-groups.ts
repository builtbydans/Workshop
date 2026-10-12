import {
  JOB_STATUS,
  TODAY_JOB_STATUSES,
  type JobStatus,
} from "@/constants/job-status";
import type { JobSummaryDto } from "@/types/job.types";

/**
 * Booking / drop-off timestamps are not persisted on `jobs` today
 * (schema has created_at, updated_at, deposit_received_at only).
 * When a real field lands on the DTO, wire it here.
 */
export function getJobBookingAt(_job: JobSummaryDto): string | null {
  return null;
}

export type JobBoardSectionId =
  | "today"
  | "outstanding"
  | "upcoming"
  | "completed";

export type JobBoardSection = {
  id: JobBoardSectionId;
  title: string;
  description: string;
  jobs: JobSummaryDto[];
  defaultOpen: boolean;
};

const TODAY_STATUSES = new Set<JobStatus>(TODAY_JOB_STATUSES);

const OUTSTANDING_STATUSES = new Set<JobStatus>([
  JOB_STATUS.AWAITING_DEPOSIT,
  JOB_STATUS.AWAITING_PARTS,
]);

const UPCOMING_STATUSES = new Set<JobStatus>([JOB_STATUS.BOOKED]);

const COMPLETED_STATUSES = new Set<JobStatus>([
  JOB_STATUS.INVOICED,
  JOB_STATUS.COMPLETED,
]);

const byCreatedAsc = (a: JobSummaryDto, b: JobSummaryDto) =>
  a.created_at.localeCompare(b.created_at);

const byUpdatedDesc = (a: JobSummaryDto, b: JobSummaryDto) =>
  b.updated_at.localeCompare(a.updated_at);

const byBookingThenCreatedAsc = (a: JobSummaryDto, b: JobSummaryDto) => {
  const aBooking = getJobBookingAt(a);
  const bBooking = getJobBookingAt(b);

  if (aBooking && bBooking) {
    return aBooking.localeCompare(bBooking);
  }
  if (aBooking) return -1;
  if (bBooking) return 1;
  return byCreatedAsc(a, b);
};

const isSameLocalDay = (iso: string, day: Date) => {
  const date = new Date(iso);
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
};

/**
 * Partition jobs into mutually exclusive board sections.
 *
 * Preferred path (when booking dates exist): today / upcoming by booking day,
 * then outstanding active work, then completed.
 *
 * Fallback (current schema): clearly labelled operational status groupings —
 * never invent booking dates from created_at / updated_at.
 */
export function groupJobsForBoard(jobs: JobSummaryDto[]): JobBoardSection[] {
  const hasAnyBookingDate = jobs.some((job) => getJobBookingAt(job) != null);

  if (hasAnyBookingDate) {
    return groupByBookingDate(jobs);
  }

  return groupByOperationalStatus(jobs);
}

function groupByBookingDate(jobs: JobSummaryDto[]): JobBoardSection[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const todayJobs: JobSummaryDto[] = [];
  const upcomingJobs: JobSummaryDto[] = [];
  const outstandingJobs: JobSummaryDto[] = [];
  const completedJobs: JobSummaryDto[] = [];

  for (const job of jobs) {
    if (COMPLETED_STATUSES.has(job.status)) {
      completedJobs.push(job);
      continue;
    }

    const bookingAt = getJobBookingAt(job);

    if (bookingAt && isSameLocalDay(bookingAt, startOfToday)) {
      todayJobs.push(job);
      continue;
    }

    if (bookingAt && new Date(bookingAt) >= startOfTomorrow) {
      upcomingJobs.push(job);
      continue;
    }

    // Past booking or no booking: keep on the operational board
    outstandingJobs.push(job);
  }

  return [
    {
      id: "today",
      title: "Today's Jobs",
      description: "Booked for drop-off today",
      jobs: todayJobs.sort(byBookingThenCreatedAsc),
      defaultOpen: true,
    },
    {
      id: "outstanding",
      title: "In Progress & Outstanding",
      description: "Active workshop work and jobs waiting on the floor",
      jobs: outstandingJobs.sort(byCreatedAsc),
      defaultOpen: true,
    },
    {
      id: "upcoming",
      title: "Upcoming Bookings",
      description: "Scheduled drop-offs after today",
      jobs: upcomingJobs.sort(byBookingThenCreatedAsc),
      defaultOpen: false,
    },
    {
      id: "completed",
      title: "Completed & Invoiced",
      description: "Recently finished and invoiced jobs",
      jobs: completedJobs.sort(byUpdatedDesc),
      defaultOpen: false,
    },
  ];
}

function groupByOperationalStatus(jobs: JobSummaryDto[]): JobBoardSection[] {
  const todayJobs: JobSummaryDto[] = [];
  const outstandingJobs: JobSummaryDto[] = [];
  const upcomingJobs: JobSummaryDto[] = [];
  const completedJobs: JobSummaryDto[] = [];

  for (const job of jobs) {
    if (TODAY_STATUSES.has(job.status)) {
      todayJobs.push(job);
    } else if (OUTSTANDING_STATUSES.has(job.status)) {
      outstandingJobs.push(job);
    } else if (UPCOMING_STATUSES.has(job.status)) {
      upcomingJobs.push(job);
    } else if (COMPLETED_STATUSES.has(job.status)) {
      completedJobs.push(job);
    } else {
      outstandingJobs.push(job);
    }
  }

  return [
    {
      id: "today",
      title: "Active Workshop Jobs",
      description:
        "In progress through ready for collection (status grouping — no booking date stored)",
      jobs: todayJobs.sort(byCreatedAsc),
      defaultOpen: true,
    },
    {
      id: "outstanding",
      title: "Waiting & Outstanding",
      description:
        "Awaiting deposit or parts (status grouping — no booking date stored)",
      jobs: outstandingJobs.sort(byCreatedAsc),
      defaultOpen: true,
    },
    {
      id: "upcoming",
      title: "Booked — Awaiting Arrival",
      description:
        "Booked jobs awaiting arrival (no scheduled drop-off date stored)",
      jobs: upcomingJobs.sort(byCreatedAsc),
      defaultOpen: false,
    },
    {
      id: "completed",
      title: "Completed & Invoiced",
      description: "Recently finished and invoiced jobs",
      jobs: completedJobs.sort(byUpdatedDesc),
      defaultOpen: false,
    },
  ];
}

export function getJobsBoardCounters(jobs: JobSummaryDto[]) {
  const sections = groupJobsForBoard(jobs);
  const todaySection = sections.find((section) => section.id === "today");
  const inProgress = jobs.filter(
    (job) => job.status === JOB_STATUS.IN_PROGRESS,
  ).length;
  const needsAttention = jobs.filter((job) => job.openRaise).length;

  return {
    todaysJobs: todaySection?.jobs.length ?? 0,
    inProgress,
    needsAttention,
  };
}
