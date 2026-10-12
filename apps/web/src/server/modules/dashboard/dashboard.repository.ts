import {
  DashboardJobDto,
  DashboardStatsDto,
} from "../../types/dashboard.types";
import {
  JOB_STATUS,
  TODAY_JOB_STATUSES,
  JobStatus,
} from "../../constants/job-status";

import supabase from "../../config/db/supabase";

const WORKSHOP_STATUSES: JobStatus[] = [
  JOB_STATUS.BOOKED,
  JOB_STATUS.AWAITING_PARTS,
  JOB_STATUS.IN_PROGRESS,
  JOB_STATUS.AWAITING_REVIEW,
  JOB_STATUS.FINAL_INSPECTION,
];

const DASHBOARD_STATUSES: JobStatus[] = [
  JOB_STATUS.AWAITING_DEPOSIT,
  JOB_STATUS.BOOKED,
  JOB_STATUS.AWAITING_PARTS,
  JOB_STATUS.IN_PROGRESS,
  JOB_STATUS.AWAITING_REVIEW,
  JOB_STATUS.FINAL_INSPECTION,
  JOB_STATUS.READY_FOR_COLLECTION,
  JOB_STATUS.INVOICED,
  JOB_STATUS.COMPLETED,
];

/** Monday 00:00 → next Monday 00:00 (local), matching ISO week boundaries. */
const getCurrentWeekRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const day = start.getDay(); // 0 Sun … 6 Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

/** ISO-8601 week number (week starts Monday). */
const getIsoWeekNumber = (date = new Date()) => {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
};

const firstRelation = <T>(relation: T | T[] | null | undefined): T | null => {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
};

const toDashboardJob = (job: any): DashboardJobDto | null => {
  const vehicle = firstRelation(job.vehicles);
  const customer = firstRelation(vehicle?.customers);

  if (!vehicle || !customer) {
    return null;
  }

  return {
    id: job.id,
    job_number: job.job_number,
    status: job.status,
    job_type: job.job_type,
    vehicles: {
      registration: vehicle.registration,
      make: vehicle.make,
      model: vehicle.model,
      customers: {
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
    },
  };
};

const getDashboardStats = async (): Promise<DashboardStatsDto> => {
  const { start, end } = getCurrentWeekRange();
  const weekNumber = getIsoWeekNumber();

  const [
    customersResult,
    vehiclesResult,
    jobsResult,
    invoicesResult,
    leadsResult,
    vehiclesInWorkshopResult,
    readyForCollectionResult,
    jobsByStatusResult,
    todaysJobsResult,
    recentActivityResult,
    completedThisWeekResult,
  ] = await Promise.all([
    supabase.from("customers").select("*", {
      count: "exact",
      head: true,
    }),
    supabase.from("vehicles").select("*", {
      count: "exact",
      head: true,
    }),
    supabase.from("jobs").select("*", {
      count: "exact",
      head: true,
    }),
    supabase.from("invoices").select("*", {
      count: "exact",
      head: true,
    }),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .in("status", [JOB_STATUS.LEAD, JOB_STATUS.QUOTED]),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .in("status", WORKSHOP_STATUSES),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", JOB_STATUS.READY_FOR_COLLECTION),
    supabase
      .from("jobs")
      .select("status")
      .is("deleted_at", null)
      .in("status", DASHBOARD_STATUSES),
    // Same status set as the Jobs board "Today's Jobs" section
    supabase
      .from("jobs")
      .select(
        `
        id,
        job_number,
        status,
        job_type,
        created_at,
        updated_at,
        vehicles (
          registration,
          make,
          model,
          customers (
            first_name,
            last_name
          )
        )
      `,
      )
      .is("deleted_at", null)
      .in("status", TODAY_JOB_STATUSES)
      .order("created_at", { ascending: true }),
    supabase
      .from("job_updates")
      .select(
        `
        id,
        message,
        created_at,
        jobs (
          job_number
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("jobs")
      .select("quoted_cost")
      .is("deleted_at", null)
      .eq("status", JOB_STATUS.COMPLETED)
      .gte("updated_at", start)
      .lt("updated_at", end),
  ]);

  const queryError = [
    customersResult,
    vehiclesResult,
    jobsResult,
    invoicesResult,
    leadsResult,
    vehiclesInWorkshopResult,
    readyForCollectionResult,
    jobsByStatusResult,
    todaysJobsResult,
    recentActivityResult,
    completedThisWeekResult,
  ].find((result) => result.error);

  if (queryError?.error) {
    throw new Error(queryError.error.message);
  }

  const jobsByStatus = DASHBOARD_STATUSES.reduce(
    (acc, status) => ({
      ...acc,
      [status]: 0,
    }),
    {} as Record<JobStatus, number>,
  );

  for (const job of jobsByStatusResult.data ?? []) {
    const status = job.status as JobStatus;
    jobsByStatus[status] = (jobsByStatus[status] ?? 0) + 1;
  }

  const revenueThisWeek = (completedThisWeekResult.data ?? []).reduce(
    (total, job) => total + Number(job.quoted_cost ?? 0),
    0,
  );

  const todaysJobs = (todaysJobsResult.data ?? [])
    .map(toDashboardJob)
    .filter((job): job is DashboardJobDto => job !== null);

  return {
    customers: customersResult.count ?? 0,
    vehicles: vehiclesResult.count ?? 0,
    jobs: jobsResult.count ?? 0,
    leads: leadsResult.count ?? 0,
    invoices: invoicesResult.count ?? 0,
    jobsToday: todaysJobs.length,
    revenueThisWeek,
    weekNumber,
    vehiclesInWorkshop: vehiclesInWorkshopResult.count ?? 0,
    readyForCollection: readyForCollectionResult.count ?? 0,
    jobsByStatus,
    todaysJobs,
    recentActivity: (recentActivityResult.data ?? []).map((activity: any) => ({
      id: activity.id,
      message: activity.message,
      created_at: activity.created_at,
      job_number: activity.jobs?.job_number ?? null,
    })),
  };
};

export { getDashboardStats };
