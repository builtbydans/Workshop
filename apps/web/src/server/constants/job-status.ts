export const JOB_STATUS = {
  LEAD: "LEAD",
  QUOTED: "QUOTED",
  AWAITING_DEPOSIT: "AWAITING_DEPOSIT",
  BOOKED: "BOOKED",
  AWAITING_PARTS: "AWAITING_PARTS",
  IN_PROGRESS: "IN_PROGRESS",
  AWAITING_REVIEW: "AWAITING_REVIEW",
  FINAL_INSPECTION: "FINAL_INSPECTION",
  READY_FOR_COLLECTION: "READY_FOR_COLLECTION",
  COMPLETED: "COMPLETED",
  INVOICED: "INVOICED",
  PAID: "PAID",
  LOST: "LOST",
} as const;

export const JOB_STATUS_MESSAGES: Record<JobStatus, string> = {
  LEAD: "Lead Created",
  QUOTED: "Quotation Issued",
  AWAITING_DEPOSIT: "Customer Accepted Quotation",
  BOOKED: "Vehicle Booked",
  AWAITING_PARTS: "Awaiting Parts",
  IN_PROGRESS: "Job Started",
  AWAITING_REVIEW: "Awaiting Review",
  FINAL_INSPECTION: "Final Inspection",
  READY_FOR_COLLECTION: "Ready For Collection",
  INVOICED: "Invoice Issued",
  COMPLETED: "Job Completed",
  PAID: "Invoice Paid",
  LOST: "Lead Marked As Lost",
};

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const LEAD_STATUSES: JobStatus[] = [
  JOB_STATUS.LEAD,
  JOB_STATUS.QUOTED,
  JOB_STATUS.LOST,
];

export const ACTIVE_JOB_STATUSES: JobStatus[] = [
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

export const JOB_TRANSITIONS: Partial<Record<JobStatus, readonly JobStatus[]>> =
  {
    [JOB_STATUS.LEAD]: [JOB_STATUS.QUOTED, JOB_STATUS.LOST],

    [JOB_STATUS.QUOTED]: [JOB_STATUS.AWAITING_DEPOSIT, JOB_STATUS.LOST],

    [JOB_STATUS.AWAITING_DEPOSIT]: [JOB_STATUS.BOOKED],

    [JOB_STATUS.BOOKED]: [JOB_STATUS.AWAITING_PARTS, JOB_STATUS.IN_PROGRESS],

    [JOB_STATUS.AWAITING_PARTS]: [JOB_STATUS.IN_PROGRESS],

    [JOB_STATUS.IN_PROGRESS]: [
      JOB_STATUS.AWAITING_REVIEW,
      JOB_STATUS.FINAL_INSPECTION,
      JOB_STATUS.READY_FOR_COLLECTION,
    ],

    [JOB_STATUS.AWAITING_REVIEW]: [JOB_STATUS.FINAL_INSPECTION],

    [JOB_STATUS.FINAL_INSPECTION]: [JOB_STATUS.READY_FOR_COLLECTION],

    [JOB_STATUS.READY_FOR_COLLECTION]: [JOB_STATUS.INVOICED],

    [JOB_STATUS.INVOICED]: [JOB_STATUS.COMPLETED],
  };

export const WORKSHOP_STATUS_SEQUENCE: JobStatus[] = [
  JOB_STATUS.BOOKED,
  JOB_STATUS.AWAITING_PARTS,
  JOB_STATUS.IN_PROGRESS,
  JOB_STATUS.AWAITING_REVIEW,
  JOB_STATUS.FINAL_INSPECTION,
  JOB_STATUS.READY_FOR_COLLECTION,
  JOB_STATUS.INVOICED,
  JOB_STATUS.COMPLETED,
];

export type ActorRole = "MANAGER" | "ADMIN" | "TECHNICIAN";

export interface JobAction {
  targetStatus: JobStatus;
  requiresReason: boolean;
  isOverride: boolean;
}

// Technicians do the workshop work and hand off at review.
// Final inspection, ready for collection, and completion are manager-only.
const TECHNICIAN_TRANSITIONS: Partial<Record<JobStatus, readonly JobStatus[]>> =
  {
    [JOB_STATUS.BOOKED]: [JOB_STATUS.AWAITING_PARTS, JOB_STATUS.IN_PROGRESS],
    [JOB_STATUS.AWAITING_PARTS]: [JOB_STATUS.IN_PROGRESS],
    [JOB_STATUS.IN_PROGRESS]: [JOB_STATUS.AWAITING_REVIEW],
  };

const TRANSITIONS_REQUIRING_REASON: ReadonlySet<JobStatus> = new Set([
  JOB_STATUS.AWAITING_PARTS,
  JOB_STATUS.LOST,
]);

const WORKSHOP_ACTION_STATUSES: ReadonlySet<JobStatus> = new Set(
  WORKSHOP_STATUS_SEQUENCE,
);

export const isWorkshopStatus = (status: JobStatus) =>
  WORKSHOP_ACTION_STATUSES.has(status);

export const isManagerRole = (role?: ActorRole | null) =>
  !role || role === "MANAGER" || role === "ADMIN";

export const actionRequiresReason = (
  currentStatus: JobStatus,
  targetStatus: JobStatus,
  role?: ActorRole | null,
) => {
  if (TRANSITIONS_REQUIRING_REASON.has(targetStatus)) {
    return true;
  }

  if (!isManagerRole(role)) {
    return false;
  }

  const machineNext = JOB_TRANSITIONS[currentStatus] ?? [];
  return !machineNext.includes(targetStatus);
};

export const getAllowedNextStatuses = (
  currentStatus: JobStatus,
  role?: ActorRole | null,
): JobStatus[] => {
  if (!isWorkshopStatus(currentStatus) && currentStatus !== JOB_STATUS.AWAITING_DEPOSIT) {
    return [];
  }

  if (isManagerRole(role)) {
    return WORKSHOP_STATUS_SEQUENCE.filter((status) => status !== currentStatus);
  }

  const machineNext = [...(JOB_TRANSITIONS[currentStatus] ?? [])].filter(
    (status) => WORKSHOP_ACTION_STATUSES.has(status),
  );
  const technicianNext = TECHNICIAN_TRANSITIONS[currentStatus] ?? [];
  return machineNext.filter((status) => technicianNext.includes(status));
};

export const getAllowedActions = (
  currentStatus: JobStatus,
  role?: ActorRole | null,
): JobAction[] => {
  const machineNext = JOB_TRANSITIONS[currentStatus] ?? [];

  return getAllowedNextStatuses(currentStatus, role)
    .filter((status) => status !== JOB_STATUS.INVOICED)
    .map((targetStatus) => ({
      targetStatus,
      requiresReason: actionRequiresReason(currentStatus, targetStatus, role),
      isOverride: isManagerRole(role) && !machineNext.includes(targetStatus),
    }));
};
