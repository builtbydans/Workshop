import { beforeEach, describe, expect, it, vi } from "vitest";

import { JOB_STATUS } from "../../constants/job-status";
import { ERROR_CODES } from "../../errors/AppError";

/**
 * Job transition unit tests — status changes without a database.
 *
 * transitionJob is the main "changing things" flow in the workshop.
 * These tests focus on guard rails: who can move what, and when.
 */
const jobRepository = {
  getJobById: vi.fn(),
  updateJobStatus: vi.fn(),
};

const auditRepository = {
  createAuditLog: vi.fn(),
};

const jobUpdateService = {
  createWorkflowUpdate: vi.fn(),
  getJobUpdatesByJobId: vi.fn(),
};

const jobRaiseService = {
  resolveOpenRaiseForJob: vi.fn(),
  getOpenRaiseForJob: vi.fn(),
  getOpenRaisesByJobIds: vi.fn(),
  canTechnicianRaise: vi.fn(),
  raiseToManager: vi.fn(),
  acknowledgeRaise: vi.fn(),
  resolveRaise: vi.fn(),
};

const workItemService = {
  getWorkItemsForJob: vi.fn(),
  canEditWorkItems: vi.fn(),
  createWorkItem: vi.fn(),
  updateWorkItem: vi.fn(),
  deleteWorkItem: vi.fn(),
};

const invoiceService = {
  jobHasPaidInvoice: vi.fn(),
  isInvoicePaid: vi.fn(),
  isInvoiceConfirmed: vi.fn(),
  getInvoiceByJobId: vi.fn(),
  isInvoiceEligibleStatus: vi.fn(),
};

const employeeRepository = {
  getEmployeeById: vi.fn(),
};

vi.mock("./job.repository", () => jobRepository);
vi.mock("../audit/audit.repository", () => auditRepository);
vi.mock("./updates/job-update.service", () => jobUpdateService);
vi.mock("./raises/job-raise.service", () => jobRaiseService);
vi.mock("./work-items/work-item.service", () => workItemService);
vi.mock("../invoice/invoice.service", () => invoiceService);
vi.mock("../employee/employee.repository", () => employeeRepository);

const jobService = await import("./job.service");

const JOB_ID = "job-1";
const TECH_ID = "tech-1";
const MANAGER_ID = "mgr-1";

const bookedJob = {
  id: JOB_ID,
  status: JOB_STATUS.BOOKED,
  assigned_technician_id: TECH_ID,
};

beforeEach(() => {
  vi.clearAllMocks();
  auditRepository.createAuditLog.mockResolvedValue(null);
  jobUpdateService.createWorkflowUpdate.mockResolvedValue(null);
  jobRaiseService.resolveOpenRaiseForJob.mockResolvedValue(null);
});

describe("transitionJob — access control", () => {
  it("blocks a technician from transitioning another technician's job", async () => {
    jobRepository.getJobById.mockResolvedValue(bookedJob);

    await expect(
      jobService.transitionJob(JOB_ID, {
        targetStatus: JOB_STATUS.IN_PROGRESS,
        actorRole: "TECHNICIAN",
        actorEmployeeId: "other-tech",
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: ERROR_CODES.FORBIDDEN,
      message: "This job is not assigned to you",
    });

    expect(jobRepository.updateJobStatus).not.toHaveBeenCalled();
  });
});

describe("transitionJob — valid moves", () => {
  it("rejects an invalid status jump for a technician", async () => {
    jobRepository.getJobById.mockResolvedValue(bookedJob);

    await expect(
      jobService.transitionJob(JOB_ID, {
        targetStatus: JOB_STATUS.COMPLETED,
        actorRole: "TECHNICIAN",
        actorEmployeeId: TECH_ID,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: ERROR_CODES.INVALID_STATUS_TRANSITION,
    });
  });
});

describe("transitionJob — manager overrides", () => {
  it("requires a note when a manager skips the normal workflow", async () => {
    jobRepository.getJobById.mockResolvedValue(bookedJob);

    await expect(
      jobService.transitionJob(JOB_ID, {
        targetStatus: JOB_STATUS.AWAITING_REVIEW,
        actorRole: "MANAGER",
        actorEmployeeId: MANAGER_ID,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "A reason is required for this action",
    });
  });
});

describe("transitionJob — completion rules", () => {
  it("requires a paid invoice before marking a job completed", async () => {
    jobRepository.getJobById.mockResolvedValue({
      ...bookedJob,
      status: JOB_STATUS.INVOICED,
    });
    invoiceService.jobHasPaidInvoice.mockResolvedValue(false);

    await expect(
      jobService.transitionJob(JOB_ID, {
        targetStatus: JOB_STATUS.COMPLETED,
        actorRole: "MANAGER",
        actorEmployeeId: MANAGER_ID,
        note: "Customer collected in person",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining("invoice must be marked paid"),
    });
  });
});

describe("updateJobById — status changes", () => {
  it("forces clients to use the transitions endpoint for status changes", async () => {
    jobRepository.getJobById.mockResolvedValue(bookedJob);

    await expect(
      jobService.updateJobById(JOB_ID, { status: JOB_STATUS.IN_PROGRESS }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("transitions"),
    });
  });
});

describe("assignTechnician", () => {
  it("only allows managers to assign technicians", async () => {
    await expect(
      jobService.assignTechnician(JOB_ID, TECH_ID, "TECHNICIAN"),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Only managers can assign technicians",
    });
  });
});
