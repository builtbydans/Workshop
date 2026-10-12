import * as jobRaiseRepository from "./job-raise.repository";
import * as jobRepository from "../job.repository";
import { AppError, ERROR_CODES } from "../../../errors/AppError";
import {
  JOB_STATUS,
  isWorkshopStatus,
  type ActorRole,
  type JobStatus,
} from "../../../constants/job-status";
import type {
  DashboardRaiseDto,
  JobRaiseDto,
  JobRaiseNoteDto,
  RaiseEmployeeDto,
} from "../../../types/job-raise.types";

const firstRelation = <T>(relation: T | T[] | null | undefined): T | null => {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
};

const canRaiseOnStatus = (status: JobStatus) =>
  isWorkshopStatus(status) && status !== JOB_STATUS.COMPLETED;

const toEmployee = (employee: any): RaiseEmployeeDto => ({
  id: employee?.id ?? "",
  first_name: employee?.first_name ?? "Unknown",
  last_name: employee?.last_name ?? "",
});

const toRaiseDto = (raise: any): JobRaiseDto => {
  const raisedBy = firstRelation(raise.raised_by);

  const notes: JobRaiseNoteDto[] = [...(raise.notes ?? [])]
    .sort(
      (left: { created_at: string }, right: { created_at: string }) =>
        left.created_at.localeCompare(right.created_at),
    )
    .map((note: any) => ({
      id: note.id,
      body: note.body,
      created_at: note.created_at,
      employee: toEmployee(firstRelation(note.employee) ?? raisedBy),
    }));

  return {
    id: raise.id,
    job_id: raise.job_id,
    status: raise.status,
    created_at: raise.created_at,
    updated_at: raise.updated_at,
    acknowledged_at: raise.acknowledged_at,
    resolved_at: raise.resolved_at,
    raised_by: toEmployee(raisedBy),
    notes,
  };
};

const getOpenRaiseForJob = async (
  jobId: string,
): Promise<JobRaiseDto | null> => {
  const raise = await jobRaiseRepository.getOpenRaiseByJobId(jobId);
  return raise ? toRaiseDto(raise) : null;
};

const getOpenRaisesByJobIds = async (
  jobIds: string[],
): Promise<Record<string, JobRaiseDto>> => {
  const raises = await jobRaiseRepository.getOpenRaisesByJobIds(jobIds);

  return Object.fromEntries(
    raises.map((raise: any) => [raise.job_id, toRaiseDto(raise)]),
  );
};

const getOpenRaisesForDashboard = async (): Promise<DashboardRaiseDto[]> => {
  const raises = await jobRaiseRepository.getOpenRaisesForDashboard();

  return raises.map((raise: any) => {
    const job = firstRelation(raise.jobs);
    const vehicle = firstRelation(job?.vehicles);
    const raisedBy = firstRelation(raise.raised_by);
    const notes = [...(raise.notes ?? [])].sort(
      (left: { created_at: string }, right: { created_at: string }) =>
        left.created_at.localeCompare(right.created_at),
    );
    const latest = notes[notes.length - 1];

    return {
      id: raise.id,
      job_id: raise.job_id,
      job_number: job?.job_number ?? "Unknown job",
      job_status: job?.status ?? "",
      created_at: raise.created_at,
      updated_at: raise.updated_at,
      latest_note: latest?.body ?? "",
      raised_by: toEmployee(raisedBy),
      vehicles: vehicle
        ? {
            registration: vehicle.registration,
            make: vehicle.make,
            model: vehicle.model,
          }
        : null,
    };
  });
};

const canTechnicianRaise = (
  job: { assigned_technician_id?: string | null; status: string },
  employeeId?: string,
) =>
  Boolean(employeeId) &&
  job.assigned_technician_id === employeeId &&
  canRaiseOnStatus(job.status as JobStatus);

const raiseToManager = async (
  jobId: string,
  note: string,
  role?: ActorRole,
  employeeId?: string,
) => {
  const trimmedNote = note.trim();

  if (!trimmedNote) {
    throw new AppError(
      "A note is required to raise this job to a manager",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  if (role !== "TECHNICIAN" || !employeeId) {
    throw new AppError(
      "Only the assigned technician can raise a job to a manager",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const job = await jobRepository.getJobById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (!canTechnicianRaise(job, employeeId)) {
    throw new AppError(
      "You can only raise a job assigned to you",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const existing = await jobRaiseRepository.getOpenRaiseByJobId(jobId);

  if (existing) {
    await jobRaiseRepository.addNote(existing.id, employeeId, trimmedNote);
    await jobRaiseRepository.touchRaise(existing.id);
    return getOpenRaiseForJob(jobId);
  }

  const created = await jobRaiseRepository.createRaise(jobId, employeeId);

  if (!created) {
    const raceExisting = await jobRaiseRepository.getOpenRaiseByJobId(jobId);

    if (raceExisting) {
      await jobRaiseRepository.addNote(raceExisting.id, employeeId, trimmedNote);
      await jobRaiseRepository.touchRaise(raceExisting.id);
      return getOpenRaiseForJob(jobId);
    }

    throw new AppError("Unable to raise this job", 500);
  }

  await jobRaiseRepository.addNote(created.id, employeeId, trimmedNote);
  return getOpenRaiseForJob(jobId);
};

const acknowledgeRaise = async (
  jobId: string,
  raiseId: string,
  role?: ActorRole,
  employeeId?: string,
) => {
  if (role !== "MANAGER" && role !== "ADMIN") {
    throw new AppError(
      "Only managers can acknowledge a raise",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const raise = await jobRaiseRepository.getRaiseById(raiseId);

  if (!raise || raise.job_id !== jobId) {
    throw new AppError("Raise not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (raise.status !== "OPEN") {
    throw new AppError("This raise is no longer open", 409, ERROR_CODES.VALIDATION_ERROR);
  }

  await jobRaiseRepository.acknowledgeRaise(raiseId, employeeId);
  return jobRaiseRepository.getRaiseById(raiseId).then(toRaiseDto);
};

const resolveRaise = async (
  jobId: string,
  raiseId: string,
  role?: ActorRole,
  employeeId?: string,
) => {
  if (role !== "MANAGER" && role !== "ADMIN") {
    throw new AppError(
      "Only managers can resolve a raise",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const raise = await jobRaiseRepository.getRaiseById(raiseId);

  if (!raise || raise.job_id !== jobId) {
    throw new AppError("Raise not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (raise.status !== "OPEN") {
    throw new AppError("This raise is no longer open", 409, ERROR_CODES.VALIDATION_ERROR);
  }

  await jobRaiseRepository.resolveRaise(raiseId, employeeId);
  return jobRaiseRepository.getRaiseById(raiseId).then(toRaiseDto);
};

const resolveOpenRaiseForJob = async (jobId: string, employeeId?: string) => {
  const existing = await jobRaiseRepository.getOpenRaiseByJobId(jobId);

  if (!existing) {
    return;
  }

  await jobRaiseRepository.resolveRaise(existing.id, employeeId);
};

export { canRaiseOnStatus, canTechnicianRaise, getOpenRaiseForJob, getOpenRaisesByJobIds, getOpenRaisesForDashboard, raiseToManager, acknowledgeRaise, resolveRaise, resolveOpenRaiseForJob };
