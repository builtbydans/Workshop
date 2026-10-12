import * as workItemRepository from "./work-item.repository";
import * as jobRepository from "../job.repository";
import { AppError, ERROR_CODES } from "../../../errors/AppError";
import {
  JOB_STATUS,
  isManagerRole,
  type ActorRole,
  type JobStatus,
} from "../../../constants/job-status";
import type {
  CreateWorkItemDto,
  JobCostSummaryDto,
  UpdateWorkItemDto,
  WorkItemDto,
  WorkItemKind,
  WorkItemOrigin,
} from "../../../types/work-item.types";

const WORK_ITEM_KINDS: WorkItemKind[] = ["LABOUR", "PARTS", "MATERIALS"];
const WORK_ITEM_ORIGINS: WorkItemOrigin[] = ["QUOTED", "ADDITIONAL"];

const LOCKED_STATUSES: ReadonlySet<JobStatus> = new Set([
  JOB_STATUS.FINAL_INSPECTION,
  JOB_STATUS.READY_FOR_COLLECTION,
  JOB_STATUS.COMPLETED,
  JOB_STATUS.INVOICED,
  JOB_STATUS.PAID,
]);

const toMoney = (value: number) => Number(Number(value).toFixed(2));

const toNumber = (value: unknown) => toMoney(Number(value ?? 0));

const toWorkItemDto = (item: any): WorkItemDto => {
  const quantity = toNumber(item.quantity);
  const unitCost = toNumber(item.unit_cost);
  const unitPrice = toNumber(item.unit_price);

  return {
    id: item.id,
    job_id: item.job_id,
    kind: item.kind,
    origin: item.origin,
    description: item.description,
    quantity,
    unit_cost: unitCost,
    unit_price: unitPrice,
    line_cost: toMoney(quantity * unitCost),
    line_total: toMoney(quantity * unitPrice),
    sort_order: item.sort_order,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

const summariseCosts = (
  quotedCost: unknown,
  items: WorkItemDto[],
  canEdit: boolean,
): JobCostSummaryDto => {
  const actual = toMoney(
    items.reduce((total, item) => total + item.line_total, 0),
  );
  const additional = toMoney(
    items
      .filter((item) => item.origin === "ADDITIONAL")
      .reduce((total, item) => total + item.line_total, 0),
  );
  const quoted = toNumber(quotedCost);

  return {
    quoted,
    actual,
    additional,
    variance: toMoney(actual - quoted),
    canEdit,
  };
};

const canEditWorkItems = (status: JobStatus) => !LOCKED_STATUSES.has(status);

const assertCanMutate = (
  job: { assigned_technician_id?: string | null; status: string },
  role?: ActorRole,
  employeeId?: string,
) => {
  if (!canEditWorkItems(job.status as JobStatus)) {
    throw new AppError(
      "Work items are locked after final inspection",
      409,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  if (role === "TECHNICIAN") {
    if (job.assigned_technician_id !== employeeId) {
      throw new AppError(
        "You can only edit work items on jobs assigned to you",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    return;
  }

  if (!isManagerRole(role)) {
    throw new AppError(
      "You cannot edit work items",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }
};

const requireKind = (kind: string) => {
  if (!WORK_ITEM_KINDS.includes(kind as WorkItemKind)) {
    throw new AppError("Invalid work item type", 400, ERROR_CODES.VALIDATION_ERROR);
  }
};

const requireOrigin = (origin: string) => {
  if (!WORK_ITEM_ORIGINS.includes(origin as WorkItemOrigin)) {
    throw new AppError("Invalid work item origin", 400, ERROR_CODES.VALIDATION_ERROR);
  }
};

const requireMoney = (value: number, field: string) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new AppError(
      `${field} cannot be negative`,
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }
};

const requireQuantity = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new AppError(
      "Quantity must be greater than 0",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }
};

const syncJobActualCost = async (jobId: string) => {
  const items = (await workItemRepository.getWorkItemsByJobId(jobId)).map(
    toWorkItemDto,
  );
  const actual = toMoney(
    items.reduce((total: number, item: WorkItemDto) => total + item.line_total, 0),
  );

  await jobRepository.updateActualCost(jobId, actual);

  return items;
};

const getWorkItemsForJob = async (jobId: string, canEdit: boolean) => {
  const job = await jobRepository.getJobById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const items = (await workItemRepository.getWorkItemsByJobId(jobId)).map(
    toWorkItemDto,
  );

  return {
    items,
    costs: summariseCosts(job.quoted_cost, items, canEdit),
  };
};

const createWorkItem = async (
  jobId: string,
  payload: CreateWorkItemDto,
  role?: ActorRole,
  employeeId?: string,
) => {
  const job = await jobRepository.getJobById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  assertCanMutate(job, role, employeeId);

  const description = payload.description?.trim();

  if (!description) {
    throw new AppError("Description is required", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  requireKind(payload.kind);
  requireOrigin(payload.origin ?? "QUOTED");
  requireQuantity(Number(payload.quantity));
  requireMoney(Number(payload.unit_price), "Unit price");
  requireMoney(Number(payload.unit_cost ?? 0), "Unit cost");

  await workItemRepository.createWorkItem(
    jobId,
    {
      kind: payload.kind,
      origin: payload.origin ?? "QUOTED",
      description,
      quantity: toNumber(payload.quantity),
      unit_cost: toNumber(payload.unit_cost ?? 0),
      unit_price: toNumber(payload.unit_price),
    },
    employeeId,
  );

  const items = await syncJobActualCost(jobId);
  return {
    items,
    costs: summariseCosts(
      job.quoted_cost,
      items,
      canEditWorkItems(job.status as JobStatus),
    ),
  };
};

const updateWorkItem = async (
  jobId: string,
  itemId: string,
  payload: UpdateWorkItemDto,
  role?: ActorRole,
  employeeId?: string,
) => {
  const job = await jobRepository.getJobById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  assertCanMutate(job, role, employeeId);

  const existing = await workItemRepository.getWorkItemById(itemId);

  if (!existing || existing.job_id !== jobId) {
    throw new AppError("Work item not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const updates: UpdateWorkItemDto = {};

  if (payload.kind !== undefined) {
    requireKind(payload.kind);
    updates.kind = payload.kind;
  }

  if (payload.origin !== undefined) {
    requireOrigin(payload.origin);
    updates.origin = payload.origin;
  }

  if (payload.description !== undefined) {
    const description = payload.description.trim();

    if (!description) {
      throw new AppError(
        "Description is required",
        400,
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    updates.description = description;
  }

  if (payload.quantity !== undefined) {
    requireQuantity(Number(payload.quantity));
    updates.quantity = toNumber(payload.quantity);
  }

  if (payload.unit_cost !== undefined) {
    requireMoney(Number(payload.unit_cost), "Unit cost");
    updates.unit_cost = toNumber(payload.unit_cost);
  }

  if (payload.unit_price !== undefined) {
    requireMoney(Number(payload.unit_price), "Unit price");
    updates.unit_price = toNumber(payload.unit_price);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError("No work item update provided", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  await workItemRepository.updateWorkItem(itemId, updates);
  const items = await syncJobActualCost(jobId);

  return {
    items,
    costs: summariseCosts(
      job.quoted_cost,
      items,
      canEditWorkItems(job.status as JobStatus),
    ),
  };
};

const deleteWorkItem = async (
  jobId: string,
  itemId: string,
  role?: ActorRole,
  employeeId?: string,
) => {
  const job = await jobRepository.getJobById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  assertCanMutate(job, role, employeeId);

  const existing = await workItemRepository.getWorkItemById(itemId);

  if (!existing || existing.job_id !== jobId) {
    throw new AppError("Work item not found", 404, ERROR_CODES.NOT_FOUND);
  }

  await workItemRepository.deleteWorkItem(itemId);
  const items = await syncJobActualCost(jobId);

  return {
    items,
    costs: summariseCosts(
      job.quoted_cost,
      items,
      canEditWorkItems(job.status as JobStatus),
    ),
  };
};

export { canEditWorkItems, summariseCosts, getWorkItemsForJob, createWorkItem, updateWorkItem, deleteWorkItem, toWorkItemDto };
