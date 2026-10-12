import { apiFetch } from "@/lib/api";
import { createJobService } from "@/services/job.api";

export const {
  getJobs,
  getJobById,
  transitionJob,
  assignTechnician,
  raiseToManager,
  acknowledgeRaise,
  resolveRaise,
  createWorkItem,
  deleteWorkItem,
} = createJobService(apiFetch);
