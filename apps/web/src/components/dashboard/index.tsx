import Link from "next/link";
import {
  Banknote,
  CalendarClock,
  CarFront,
  ClipboardList,
  PackageCheck,
} from "lucide-react";

import { NeedsAttention } from "@/components/dashboard/NeedsAttention";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JOB_STATUS, JobStatus, formatJobStatus } from "@/constants/job-status";
import { getDashboardStats } from "@/services/dashboard.service.server";
import { unstable_rethrow } from "next/navigation";
import {
  DashboardActivityDto,
  DashboardJobDto,
  WorkshopDashboardDto,
} from "@/types/dashboard.types";
import { formatRelativeDate } from "@/utils/date";
import { formatRegistration } from "@/utils/formatRegistration";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const dashboardStatusOrder: JobStatus[] = [
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

type KpiCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const KpiCard = ({
  title,
  value,
  description,
  icon: Icon,
  badge,
}: KpiCardProps) => (
  <Card className="bg-linear-to-t from-primary/5 to-card shadow-xs">
    <CardHeader className="flex flex-row items-start justify-between gap-4">
      <div>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="mt-2 text-3xl font-semibold tabular-nums">
          {value}
        </CardTitle>
      </div>
      <div className="flex flex-col items-end gap-2">
        {badge ? (
          <span className="rounded-md border bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {badge}
          </span>
        ) : null}
        <div className="rounded-md border border-primary/15 bg-primary/10 p-2 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const TodaysJobs = ({ jobs }: { jobs: DashboardJobDto[] }) => (
  <Card className="min-w-0">
    <CardHeader className="flex flex-row items-center justify-between gap-4">
      <div>
        <CardTitle>Today&apos;s Jobs</CardTitle>
        <CardDescription>
          In progress through ready for collection ({jobs.length})
        </CardDescription>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link href="/jobs">View All Jobs</Link>
      </Button>
    </CardHeader>
    <CardContent>
      {jobs.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          No workshop jobs are active today.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Job</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle Registration</TableHead>
                <TableHead>Vehicle Make/Model</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Current Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      className="font-medium tabular-nums hover:underline"
                      href={`/jobs/${job.id}`}
                    >
                      {job.job_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {job.vehicles.customers.first_name}{" "}
                    {job.vehicles.customers.last_name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-md border bg-yellow-300 dark:text-black px-3 py-1.5 font-mono text-sm font-bold tracking-wider">
                      {formatRegistration(job.vehicles.registration)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {job.vehicles.make} {job.vehicles.model}{" "}
                  </TableCell>
                  <TableCell>{job.job_type || "Workshop job"}</TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
);

const RecentActivity = ({ activity }: { activity: DashboardActivityDto[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Latest workflow updates</CardDescription>
    </CardHeader>
    <CardContent>
      {activity.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          No activity has been recorded yet.
        </div>
      ) : (
        <div className="space-y-1">
          {activity.map((update, index) => (
            <div
              className="grid grid-cols-[1rem_1fr] gap-3 py-3"
              key={update.id}
            >
              <div className="relative flex justify-center">
                {index < activity.length - 1 && (
                  <div className="absolute top-4 bottom-[-0.875rem] w-px bg-border" />
                )}
                <div className="relative mt-1 size-2.5 rounded-full bg-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{update.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {update.job_number ?? "Unassigned job"} ·{" "}
                  {formatRelativeDate(update.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const JobsByStatus = ({ stats }: { stats: WorkshopDashboardDto }) => (
  <Card>
    <CardHeader>
      <CardTitle>Jobs by Status</CardTitle>
      <CardDescription>Current workflow distribution</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStatusOrder.map((status) => (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
            key={status}
          >
            <span className="text-sm font-medium">
              {formatJobStatus(status)}
            </span>
            <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold tabular-nums">
              {stats.jobsByStatus[status] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = async () => {
  let stats: WorkshopDashboardDto;

  try {
    stats = await getDashboardStats();
  } catch (error) {
    unstable_rethrow(error);
    return (
      <main className="p-5">
        <Card>
          <CardHeader>
            <CardTitle>Workshop Dashboard</CardTitle>
            <CardDescription>
              Unable to retrieve dashboard data right now.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6 py-6 px-12">
      <div>
        <div className="flex items-center gap-2">
          <ClipboardList className="size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Workshop Dashboard
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Today&apos;s workshop load, collections, weekly revenue, and recent
          movement.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          description="In progress through ready for collection"
          icon={CalendarClock}
          title="Jobs Today"
          value={stats.jobsToday}
        />
        <KpiCard
          badge={`Week ${stats.weekNumber}`}
          description="Completed jobs this week (Mon–Sun)"
          icon={Banknote}
          title="Weekly Revenue"
          value={currencyFormatter.format(stats.revenueThisWeek)}
        />
        <KpiCard
          description="Booked through final inspection"
          icon={CarFront}
          title="Vehicles In Workshop"
          value={stats.vehiclesInWorkshop}
        />
        <KpiCard
          description="Jobs waiting for customer collection"
          icon={PackageCheck}
          title="Ready For Collection"
          value={stats.readyForCollection}
        />
      </section>

      <NeedsAttention raises={stats.openRaises ?? []} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <TodaysJobs jobs={stats.todaysJobs} />
        <RecentActivity activity={stats.recentActivity} />
      </section>

      <JobsByStatus stats={stats} />
    </main>
  );
};

export default Dashboard;
