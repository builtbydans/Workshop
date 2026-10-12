import { z } from "zod";
import { JOB_STATUS, type JobStatus } from "../constants/job-status";

const jobStatuses = Object.values(JOB_STATUS) as [JobStatus, ...JobStatus[]];

export const transitionJobSchema = z.object({
  targetStatus: z.enum(jobStatuses),
  note: z.string().trim().max(500).optional(),
});

export const assignTechnicianSchema = z.object({
  technicianId: z.string().uuid().nullable(),
});

export const raiseToManagerSchema = z.object({
  note: z.string().trim().min(1).max(500),
});

const workItemKinds = ["LABOUR", "PARTS", "MATERIALS"] as const;
const workItemOrigins = ["QUOTED", "ADDITIONAL"] as const;

export const createWorkItemSchema = z.object({
  kind: z.enum(workItemKinds),
  origin: z.enum(workItemOrigins).optional(),
  description: z.string().trim().min(1).max(500),
  quantity: z.coerce.number().positive(),
  unit_cost: z.coerce.number().min(0).optional(),
  unit_price: z.coerce.number().min(0),
});

export const updateWorkItemSchema = z
  .object({
    kind: z.enum(workItemKinds).optional(),
    origin: z.enum(workItemOrigins).optional(),
    description: z.string().trim().min(1).max(500).optional(),
    quantity: z.coerce.number().positive().optional(),
    unit_cost: z.coerce.number().min(0).optional(),
    unit_price: z.coerce.number().min(0).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "No work item update provided",
  });

