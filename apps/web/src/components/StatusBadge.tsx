import { Badge } from "@/components/ui/badge";
import {
  JOB_STATUS,
  JobStatus,
  formatJobStatus,
} from "@/constants/job-status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: JobStatus;
}

const getStatusClassName = (status: JobStatus) => {
  switch (status) {
    case JOB_STATUS.LEAD:
    case JOB_STATUS.QUOTED:
    case JOB_STATUS.AWAITING_DEPOSIT:
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";

    case JOB_STATUS.BOOKED:
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300";

    case JOB_STATUS.AWAITING_PARTS:
    case JOB_STATUS.AWAITING_REVIEW:
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";

    case JOB_STATUS.IN_PROGRESS:
    case JOB_STATUS.FINAL_INSPECTION:
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";

    case JOB_STATUS.READY_FOR_COLLECTION:
      return "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300";

    case JOB_STATUS.INVOICED:
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";

    case JOB_STATUS.COMPLETED:
    case JOB_STATUS.PAID:
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";

    case JOB_STATUS.LOST:
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";

    default:
      return "";
  }
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge
      className={cn("border font-medium", getStatusClassName(status))}
      variant="outline"
    >
      {formatJobStatus(status)}
    </Badge>
  );
};

export default StatusBadge;
