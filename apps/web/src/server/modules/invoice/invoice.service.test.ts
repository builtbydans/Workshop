import { beforeEach, describe, expect, it, vi } from "vitest";

import { INVOICE_STATUS } from "../../types/invoice.types";
import { JOB_STATUS } from "../../constants/job-status";
import { ERROR_CODES } from "../../errors/AppError";

/**
 * Unit test — tests one module in isolation with mocked repositories.
 */
const invoiceRepository = {
  getInvoices: vi.fn(),
  getInvoiceById: vi.fn(),
  getInvoiceByJobId: vi.fn(),
  createInvoice: vi.fn(),
  createInvoiceLines: vi.fn(),
  updateInvoiceById: vi.fn(),
  deleteInvoiceById: vi.fn(),
};

const jobRepository = {
  getJobById: vi.fn(),
  updateJobStatus: vi.fn(),
};

const workItemRepository = {
  getWorkItemsByJobId: vi.fn(),
};

const auditRepository = {
  createAuditLog: vi.fn(),
};

const jobUpdateService = {
  createWorkflowUpdate: vi.fn(),
  createBillingUpdate: vi.fn(),
};

vi.mock("./invoice.repository", () => invoiceRepository);
vi.mock("../job/job.repository", () => jobRepository);
vi.mock("../job/work-items/work-item.repository", () => workItemRepository);
vi.mock("../audit/audit.repository", () => auditRepository);
vi.mock("../job/updates/job-update.service", () => jobUpdateService);

const invoiceService = await import("./invoice.service");

const JOB_ID = "job-111";
const INVOICE_ID = "inv-222";
const ACTOR_ID = "manager-333";

const readyJob = {
  id: JOB_ID,
  status: JOB_STATUS.READY_FOR_COLLECTION,
  job_number: "JOB-001",
  deposit_received_at: null,
  deposit_amount: 0,
  vehicles: {
    registration: "AB12 CDE",
    make: "Ford",
    model: "Focus",
    customers: {
      first_name: "Alex",
      last_name: "Smith",
      email: "alex@example.com",
      phone: "07123456789",
    },
  },
};

const workItems = [
  {
    id: "wi-1",
    kind: "LABOUR",
    origin: "QUOTED",
    description: "Diagnostic labour",
    quantity: 2,
    unit_price: 50,
    sort_order: 0,
  },
  {
    id: "wi-2",
    kind: "PARTS",
    origin: "ADDITIONAL",
    description: "Brake pads",
    quantity: 1,
    unit_price: 80,
    sort_order: 1,
  },
];

const buildStoredInvoice = (overrides: Record<string, unknown> = {}) => ({
  id: INVOICE_ID,
  job_id: JOB_ID,
  invoice_number: "INV-2026-000001",
  status: INVOICE_STATUS.DRAFT,
  subtotal: 180,
  discount: 0,
  vat_rate: 20,
  vat: 36,
  total: 216,
  deposit_paid: 0,
  amount_paid: 0,
  created_at: "2026-08-19T10:00:00.000Z",
  updated_at: "2026-08-19T10:00:00.000Z",
  issued_at: null,
  due_at: null,
  paid_at: null,
  voided_at: null,
  job_number: "JOB-001",
  customer_name: "Alex Smith",
  customer_email: "alex@example.com",
  customer_phone: "07123456789",
  vehicle_registration: "AB12 CDE",
  vehicle_make: "Ford",
  vehicle_model: "Focus",
  lines: [],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("invoice.service authorization", () => {
  it("rejects technicians from billing actions", async () => {
    await expect(
      invoiceService.getInvoices("TECHNICIAN"),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: ERROR_CODES.FORBIDDEN,
      message: "Only managers can manage invoices",
    });
  });
});

describe("invoice.service generateDraft", () => {
  it("requires the job to be ready for collection", async () => {
    invoiceRepository.getInvoiceByJobId.mockResolvedValue(null);
    jobRepository.getJobById.mockResolvedValue({
      ...readyJob,
      status: JOB_STATUS.IN_PROGRESS,
    });

    await expect(
      invoiceService.generateDraft({ job_id: JOB_ID }, "MANAGER"),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: expect.stringContaining("ready for collection"),
    });
  });

  it("requires at least one work item", async () => {
    invoiceRepository.getInvoiceByJobId.mockResolvedValue(null);
    jobRepository.getJobById.mockResolvedValue(readyJob);
    workItemRepository.getWorkItemsByJobId.mockResolvedValue([]);

    await expect(
      invoiceService.generateDraft({ job_id: JOB_ID }, "MANAGER"),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("work item"),
    });
  });

  it("calculates VAT and totals from work items", async () => {
    const createdInvoice = buildStoredInvoice();

    invoiceRepository.getInvoiceByJobId.mockResolvedValue(null);
    jobRepository.getJobById.mockResolvedValue(readyJob);
    workItemRepository.getWorkItemsByJobId.mockResolvedValue(workItems);
    invoiceRepository.createInvoice.mockResolvedValue(createdInvoice);
    invoiceRepository.createInvoiceLines.mockResolvedValue([]);
    auditRepository.createAuditLog.mockResolvedValue(null);
    jobRepository.updateJobStatus.mockResolvedValue(null);
    jobUpdateService.createWorkflowUpdate.mockResolvedValue(null);
    invoiceRepository.getInvoiceById.mockResolvedValue({
      ...createdInvoice,
      lines: [
        {
          id: "line-1",
          source_work_item_id: "wi-1",
          kind: "LABOUR",
          origin: "QUOTED",
          description: "Diagnostic labour",
          quantity: 2,
          unit_price: 50,
          line_total: 100,
          sort_order: 0,
        },
        {
          id: "line-2",
          source_work_item_id: "wi-2",
          kind: "PARTS",
          origin: "ADDITIONAL",
          description: "Brake pads",
          quantity: 1,
          unit_price: 80,
          line_total: 80,
          sort_order: 1,
        },
      ],
    });

    const invoice = await invoiceService.generateDraft(
      { job_id: JOB_ID },
      "MANAGER",
      ACTOR_ID,
    );

    expect(invoiceRepository.createInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        subtotal: 180,
        discount: 0,
        vat_rate: 20,
        vat: 36,
        total: 216,
        amount_paid: 0,
      }),
    );
    expect(invoice.subtotal).toBe(180);
    expect(invoice.vat).toBe(36);
    expect(invoice.total).toBe(216);
    expect(invoice.balance_due).toBe(216);
    expect(auditRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "GENERATE_DRAFT",
        created_by: ACTOR_ID,
      }),
    );
  });

  it("returns the existing invoice instead of creating a duplicate", async () => {
    const existingInvoice = buildStoredInvoice({
      status: INVOICE_STATUS.DRAFT,
    });

    invoiceRepository.getInvoiceByJobId.mockResolvedValue(existingInvoice);
    jobRepository.getJobById.mockResolvedValue(readyJob);
    jobRepository.updateJobStatus.mockResolvedValue(null);
    jobUpdateService.createWorkflowUpdate.mockResolvedValue(null);

    const invoice = await invoiceService.generateDraft(
      { job_id: JOB_ID },
      "MANAGER",
    );

    expect(invoiceRepository.createInvoice).not.toHaveBeenCalled();
    expect(invoice.id).toBe(INVOICE_ID);
    expect(jobRepository.updateJobStatus).toHaveBeenCalledWith(
      JOB_ID,
      JOB_STATUS.INVOICED,
    );
  });

  it("applies deposit already taken on the job", async () => {
    const createdInvoice = buildStoredInvoice({
      deposit_paid: 50,
      amount_paid: 50,
      total: 216,
    });

    invoiceRepository.getInvoiceByJobId.mockResolvedValue(null);
    jobRepository.getJobById.mockResolvedValue({
      ...readyJob,
      deposit_received_at: "2026-08-18T12:00:00.000Z",
      deposit_amount: 50,
    });
    workItemRepository.getWorkItemsByJobId.mockResolvedValue(workItems);
    invoiceRepository.createInvoice.mockResolvedValue(createdInvoice);
    invoiceRepository.createInvoiceLines.mockResolvedValue([]);
    auditRepository.createAuditLog.mockResolvedValue(null);
    jobRepository.updateJobStatus.mockResolvedValue(null);
    jobUpdateService.createWorkflowUpdate.mockResolvedValue(null);
    invoiceRepository.getInvoiceById.mockResolvedValue(createdInvoice);

    await invoiceService.generateDraft({ job_id: JOB_ID }, "MANAGER");

    expect(invoiceRepository.createInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        deposit_paid: 50,
        amount_paid: 50,
      }),
    );
  });
});

describe("invoice.service status guards", () => {
  it("only allows draft invoices to be issued", async () => {
    invoiceRepository.getInvoiceById.mockResolvedValue(
      buildStoredInvoice({ status: INVOICE_STATUS.PAID }),
    );

    await expect(
      invoiceService.issueInvoice(INVOICE_ID, "MANAGER"),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Only draft invoices can be issued",
    });
  });

  it("only allows unpaid invoices to be marked paid", async () => {
    invoiceRepository.getInvoiceById.mockResolvedValue(
      buildStoredInvoice({ status: INVOICE_STATUS.DRAFT }),
    );

    await expect(
      invoiceService.markInvoicePaid(INVOICE_ID, "MANAGER"),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Only unpaid invoices can be marked paid",
    });
  });

  it("prevents voiding a paid invoice", async () => {
    invoiceRepository.getInvoiceById.mockResolvedValue(
      buildStoredInvoice({ status: INVOICE_STATUS.PAID }),
    );

    await expect(
      invoiceService.voidInvoice(INVOICE_ID, "MANAGER"),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Only draft or unpaid invoices can be voided",
    });
  });

  it("marks an unpaid invoice as paid and records the full total", async () => {
    const unpaidInvoice = buildStoredInvoice({
      status: INVOICE_STATUS.UNPAID,
      total: 216,
      amount_paid: 0,
    });
    const paidInvoice = buildStoredInvoice({
      status: INVOICE_STATUS.PAID,
      total: 216,
      amount_paid: 216,
      paid_at: "2026-08-19T11:00:00.000Z",
    });

    invoiceRepository.getInvoiceById
      .mockResolvedValueOnce(unpaidInvoice)
      .mockResolvedValueOnce(paidInvoice);
    invoiceRepository.updateInvoiceById.mockResolvedValue(paidInvoice);
    auditRepository.createAuditLog.mockResolvedValue(null);
    jobUpdateService.createBillingUpdate.mockResolvedValue(null);

    const invoice = await invoiceService.markInvoicePaid(
      INVOICE_ID,
      "MANAGER",
      ACTOR_ID,
    );

    expect(invoiceRepository.updateInvoiceById).toHaveBeenCalledWith(
      INVOICE_ID,
      expect.objectContaining({
        status: INVOICE_STATUS.PAID,
        amount_paid: 216,
      }),
    );
    expect(invoice.status).toBe(INVOICE_STATUS.PAID);
    expect(invoice.balance_due).toBe(0);
  });
});

describe("invoice.service eligibility helpers", () => {
  it("treats ready-for-collection jobs as invoice eligible", () => {
    expect(
      invoiceService.isInvoiceEligibleStatus(JOB_STATUS.READY_FOR_COLLECTION),
    ).toBe(true);
  });

  it("treats in-progress jobs as not invoice eligible", () => {
    expect(invoiceService.isInvoiceEligibleStatus(JOB_STATUS.IN_PROGRESS)).toBe(
      false,
    );
  });
});
