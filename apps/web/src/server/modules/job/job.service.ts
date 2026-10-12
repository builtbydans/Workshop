import * as jobRepository from "./job.repository";
import * as auditRepository from "../audit/audit.repository";
import * as jobUpdateService from "./updates/job-update.service";
import * as jobRaiseService from "./raises/job-raise.service";
import * as workItemService from "./work-items/work-item.service";
import * as invoiceService from "../invoice/invoice.service";
import * as employeeRepository from "../employee/employee.repository";
import { AppError, ERROR_CODES } from "../../errors/AppError";
import {
  CreateJobDto,
  TransitionJobDto,
  UpdateJobDto,
} from "../../types/job.types";
import { QuoteLeadDto } from "../../types/lead.types";
import {
  ActorRole,
  JOB_STATUS,
  JOB_TRANSITIONS,
  JobStatus,
  actionRequiresReason,
  getAllowedActions,
  getAllowedNextStatuses,
  isManagerRole,
} from "../../constants/job-status";

const validateStatusTransition = (
  currentStatus: string,
  nextStatus: JobStatus,
) => {
  const allowedNext = [
    ...(JOB_TRANSITIONS[currentStatus as JobStatus] ?? []),
  ];

  if (!allowedNext.includes(nextStatus)) {
    throw new AppError(
      `Invalid job status transition: ${currentStatus} -> ${nextStatus}`,
      409,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
      { allowedNext },
    );
  }
};

const validateWorkshopTransition = (
  currentStatus: string,
  nextStatus: JobStatus,
  role?: ActorRole,
) => {
  const allowedNext = getAllowedNextStatuses(
    currentStatus as JobStatus,
    role,
  );

  if (!allowedNext.includes(nextStatus)) {
    throw new AppError(
      `Invalid job status transition: ${currentStatus} -> ${nextStatus}`,
      409,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
      { allowedNext },
    );
  }
};

const getJobs = async (role?: ActorRole, employeeId?: string) => {
  const assignedTechnicianId =
    role === "TECHNICIAN" ? employeeId : undefined;

  const jobs = await jobRepository.getJobs(assignedTechnicianId);
  const raisesByJobId = await jobRaiseService.getOpenRaisesByJobIds(
    jobs.map((job: { id: string }) => job.id),
  );

  return jobs.map((job: any) => ({
    ...job,
    openRaise: raisesByJobId[job.id] ?? null,
    canRaiseToManager:
      role === "TECHNICIAN" &&
      jobRaiseService.canTechnicianRaise(job, employeeId),
  }));
};

const getJobById = async (
  id: string,
  role?: ActorRole,
  employeeId?: string,
) => {
  const job = await jobRepository.getJobById(id);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (
    role === "TECHNICIAN" &&
    job.assigned_technician_id !== employeeId
  ) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const canManageInvoice = role === "MANAGER" || role === "ADMIN";
  const [updates, openRaise, workItems, invoice] = await Promise.all([
    jobUpdateService.getJobUpdatesByJobId(id),
    jobRaiseService.getOpenRaiseForJob(id),
    workItemService.getWorkItemsForJob(
      id,
      workItemService.canEditWorkItems(job.status as JobStatus),
    ),
    canManageInvoice
      ? invoiceService.getInvoiceByJobId(id, role)
      : Promise.resolve(null),
  ]);
  const invoicePaid = invoiceService.isInvoicePaid(invoice);

  return {
    ...job,
    updates,
    openRaise,
    workItems: workItems.items,
    costs: workItems.costs,
    invoice: canManageInvoice ? invoice : null,
    invoiceConfirmed: invoiceService.isInvoiceConfirmed(invoice),
    invoicePaid,
    canGenerateInvoice:
      canManageInvoice &&
      (!invoice || invoice.status === "VOID") &&
      workItems.items.length > 0 &&
      invoiceService.isInvoiceEligibleStatus(job.status as JobStatus),
    canConfirmInvoice:
      canManageInvoice && invoice?.status === "DRAFT",
    canRaiseToManager:
      role === "TECHNICIAN" &&
      jobRaiseService.canTechnicianRaise(job, employeeId),
    allowedActions: getAllowedActions(job.status as JobStatus, role).filter(
      (action: { targetStatus: JobStatus }) =>
        action.targetStatus !== JOB_STATUS.COMPLETED || invoicePaid,
    ),
  };
};

const getLeads = async () => {
  return await jobRepository.getLeads();
};

const getLeadById = async (id: string) => {
  return await jobRepository.getLeadById(id);
};

const quoteLead = async (id: string, data: QuoteLeadDto) => {
  const existingLead = await jobRepository.getLeadById(id);

  if (!existingLead) {
    throw new AppError("Lead not found", 404);
  }

  validateStatusTransition(existingLead.status, JOB_STATUS.QUOTED);

  if (!data.job_type?.trim()) {
    throw new AppError("Job type is required", 400);
  }

  if (data.quoted_cost <= 0) {
    throw new AppError("Quoted cost must be greater than 0", 400);
  }

  const updatedLead = await jobRepository.quoteLead(id, data);
  await jobUpdateService.createWorkflowUpdate(id, JOB_STATUS.QUOTED);

  return updatedLead;
};

const markLeadAsLost = async (id: string) => {
  const lead = await jobRepository.getLeadById(id);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  if (lead.status === JOB_STATUS.LOST) {
    throw new AppError("Lead is already marked as lost", 400);
  }

  validateStatusTransition(lead.status, JOB_STATUS.LOST);

  const updatedLead = await jobRepository.markLeadAsLost(id);
  await jobUpdateService.createWorkflowUpdate(id, JOB_STATUS.LOST);

  return updatedLead;
};

const acceptQuote = async (id: string) => {
  const lead = await jobRepository.getLeadById(id);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  validateStatusTransition(lead.status, JOB_STATUS.AWAITING_DEPOSIT);

  const updatedLead = await jobRepository.acceptQuote(id);
  await jobUpdateService.createWorkflowUpdate(id, JOB_STATUS.AWAITING_DEPOSIT);

  return updatedLead;
};

const confirmDeposit = async (id: string) => {
  const job = await jobRepository.getJobById(id);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  validateStatusTransition(job.status, JOB_STATUS.BOOKED);

  const updatedJob = await jobRepository.confirmDeposit(id);
  await jobUpdateService.createWorkflowUpdate(id, JOB_STATUS.BOOKED);

  return updatedJob;
};

const createJob = async (jobData: CreateJobDto) => {
  let { vehicle_id, job_type, description } = jobData;

  job_type = job_type?.trim();
  description = description?.trim();

  if (!vehicle_id) {
    throw new AppError("Vehicle ID is required", 400);
  }

  const job = await jobRepository.createJob({
    vehicle_id,
    description,
  });

  await auditRepository.createAuditLog({
    entity_type: "job",
    entity_id: job.id,
    action: "CREATE",
    old_value: null,
    new_value: job,
  });

  return job;
};

const updateJobById = async (id: string, updatedData: UpdateJobDto) => {
  if (!updatedData || Object.keys(updatedData).length === 0) {
    throw new AppError("No update provided", 400);
  }

  const existingJob = await jobRepository.getJobById(id);

  if (!existingJob) {
    throw new AppError("Job not found", 404);
  }

  if (updatedData.status !== undefined) {
    throw new AppError(
      "Use POST /jobs/:id/transitions to change job status",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const updatedJob = await jobRepository.updateJobById(id, updatedData);

  await auditRepository.createAuditLog({
    entity_type: "job",
    entity_id: id,
    action: "UPDATE",
    old_value: existingJob,
    new_value: updatedJob,
  });

  return updatedJob;
};

const deleteJobById = async (id: string) => {
  const existingJob = await jobRepository.getJobById(id);

  if (!existingJob) {
    throw new AppError("Job not found", 404);
  }

  const deletedJob = await jobRepository.deleteJobById(id);

  await auditRepository.createAuditLog({
    entity_type: "job",
    entity_id: id,
    action: "DELETE",
    old_value: existingJob,
    new_value: deletedJob,
  });

  return deletedJob;
};

const transitionJob = async (id: string, command: TransitionJobDto) => {
  const job = await jobRepository.getJobById(id);

  if (!job) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (
    command.actorRole === "TECHNICIAN" &&
    job.assigned_technician_id !== command.actorEmployeeId
  ) {
    throw new AppError(
      "This job is not assigned to you",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  validateWorkshopTransition(job.status, command.targetStatus, command.actorRole);

  if (command.targetStatus === JOB_STATUS.COMPLETED) {
    const invoicePaid = await invoiceService.jobHasPaidInvoice(id);

    if (!invoicePaid) {
      throw new AppError(
        "The invoice must be marked paid before this job can be completed",
        409,
        ERROR_CODES.VALIDATION_ERROR,
      );
    }
  }

  if (
    actionRequiresReason(
      job.status as JobStatus,
      command.targetStatus,
      command.actorRole,
    ) &&
    !command.note?.trim()
  ) {
    throw new AppError(
      "A reason is required for this action",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const updatedJob = await jobRepository.updateJobStatus(
    id,
    command.targetStatus,
  );

  await jobUpdateService.createWorkflowUpdate(
    id,
    command.targetStatus,
    command.note,
  );

  if (isManagerRole(command.actorRole)) {
    await jobRaiseService.resolveOpenRaiseForJob(id, command.actorEmployeeId);
  }

  await auditRepository.createAuditLog({
    entity_type: "job",
    entity_id: id,
    action: "TRANSITION",
    old_value: job,
    new_value: updatedJob,
    created_by: command.actorId ?? null,
  });

  return getJobById(id, command.actorRole, command.actorEmployeeId);
};

const assignTechnician = async (
  id: string,
  technicianId: string | null,
  role?: ActorRole,
) => {
  if (!isManagerRole(role)) {
    throw new AppError(
      "Only managers can assign technicians",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const job = await jobRepository.getJobById(id);

  if (!job) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (technicianId) {
    const technician = await employeeRepository.getEmployeeById(technicianId);

    if (!technician || technician.role !== "TECHNICIAN") {
      throw new AppError("Technician not found", 400, ERROR_CODES.VALIDATION_ERROR);
    }
  }

  await jobRepository.assignTechnician(id, technicianId);

  return getJobById(id, role);
};

const createWorkItem = async (
  jobId: string,
  payload: any,
  role?: ActorRole,
  employeeId?: string,
) => {
  await workItemService.createWorkItem(jobId, payload, role, employeeId);
  return getJobById(jobId, role, employeeId);
};

const updateWorkItem = async (
  jobId: string,
  itemId: string,
  payload: any,
  role?: ActorRole,
  employeeId?: string,
) => {
  await workItemService.updateWorkItem(jobId, itemId, payload, role, employeeId);
  return getJobById(jobId, role, employeeId);
};

const deleteWorkItem = async (
  jobId: string,
  itemId: string,
  role?: ActorRole,
  employeeId?: string,
) => {
  await workItemService.deleteWorkItem(jobId, itemId, role, employeeId);
  return getJobById(jobId, role, employeeId);
};

const raiseToManager = jobRaiseService.raiseToManager;
const acknowledgeRaise = jobRaiseService.acknowledgeRaise;
const resolveRaise = jobRaiseService.resolveRaise;

export {
  getJobs,
  getJobById,
  getLeads,
  getLeadById,
  quoteLead,
  acceptQuote,
  confirmDeposit,
  createJob,
  updateJobById,
  deleteJobById,
  markLeadAsLost,
  transitionJob,
  assignTechnician,
  raiseToManager,
  acknowledgeRaise,
  resolveRaise,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem,
};
