import * as invoiceRepository from "./invoice.repository";
import * as jobRepository from "../job/job.repository";
import * as workItemRepository from "../job/work-items/work-item.repository";
import * as auditRepository from "../audit/audit.repository";
import * as jobUpdateService from "../job/updates/job-update.service";
import { AppError, ERROR_CODES } from "../../errors/AppError";

import {
  CreateInvoiceData,
  CreateInvoiceLineData,
  GenerateInvoiceDto,
  INVOICE_STATUS,
  InvoiceDto,
  InvoiceLineDto,
  InvoiceStatus,
  UpdateInvoiceData,
} from "../../types/invoice.types";
import {
  JOB_STATUS,
  type ActorRole,
  type JobStatus,
} from "../../constants/job-status";

const VAT_RATE = 20;
const INVOICE_ELIGIBLE_STATUSES: ReadonlySet<JobStatus> = new Set([
  JOB_STATUS.READY_FOR_COLLECTION,
  JOB_STATUS.INVOICED,
  JOB_STATUS.COMPLETED,
  JOB_STATUS.PAID,
]);

const isInvoiceEligibleStatus = (status: JobStatus) =>
  INVOICE_ELIGIBLE_STATUSES.has(status);

const CONFIRMED_INVOICE_STATUSES: ReadonlySet<InvoiceStatus> = new Set([
  INVOICE_STATUS.UNPAID,
  INVOICE_STATUS.PAID,
]);

const isInvoiceConfirmed = (invoice?: { status?: InvoiceStatus } | null) =>
  Boolean(invoice && CONFIRMED_INVOICE_STATUSES.has(invoice.status as InvoiceStatus));

const firstRelation = <T>(relation: T | T[] | null | undefined): T | null => {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
};

const money = (value: unknown) => Number(Number(value ?? 0).toFixed(2));

const requireBillingRole = (role?: ActorRole) => {
  if (role !== "MANAGER" && role !== "ADMIN") {
    throw new AppError(
      "Only managers can manage invoices",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }
};

const toInvoiceLineDto = (line: any): InvoiceLineDto => ({
  id: line.id,
  source_work_item_id: line.source_work_item_id ?? null,
  kind: line.kind,
  origin: line.origin,
  description: line.description,
  quantity: money(line.quantity),
  unit_price: money(line.unit_price),
  line_total: money(line.line_total),
  sort_order: line.sort_order ?? 0,
});

const toInvoiceDto = (invoice: any): InvoiceDto => {
  const total = money(invoice.total);
  const amountPaid = money(invoice.amount_paid);

  return {
    id: invoice.id,
    job_id: invoice.job_id,
    invoice_number: invoice.invoice_number,
    status: invoice.status as InvoiceStatus,
    subtotal: money(invoice.subtotal),
    discount: money(invoice.discount),
    vat_rate: money(invoice.vat_rate),
    vat: money(invoice.vat),
    total,
    deposit_paid: money(invoice.deposit_paid),
    amount_paid: amountPaid,
    balance_due: money(Math.max(total - amountPaid, 0)),
    created_at: invoice.created_at,
    updated_at: invoice.updated_at,
    issued_at: invoice.issued_at ?? null,
    due_at: invoice.due_at ?? null,
    paid_at: invoice.paid_at ?? null,
    voided_at: invoice.voided_at ?? null,
    job_number: invoice.job_number ?? "",
    customer_name: invoice.customer_name ?? "",
    customer_email: invoice.customer_email ?? null,
    customer_phone: invoice.customer_phone ?? null,
    vehicle_registration: invoice.vehicle_registration ?? "",
    vehicle_make: invoice.vehicle_make ?? "",
    vehicle_model: invoice.vehicle_model ?? "",
    lines: [...(invoice.lines ?? [])]
      .sort(
        (left: any, right: any) =>
          (left.sort_order ?? 0) - (right.sort_order ?? 0),
      )
      .map(toInvoiceLineDto),
  };
};

const getInvoices = async (role?: ActorRole) => {
  requireBillingRole(role);
  const invoices = await invoiceRepository.getInvoices();
  return (invoices ?? []).map(toInvoiceDto);
};

const getInvoiceById = async (id: string, role?: ActorRole) => {
  requireBillingRole(role);
  const invoice = await invoiceRepository.getInvoiceById(id);

  if (!invoice) {
    throw new AppError("Invoice not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return toInvoiceDto(invoice);
};

const findInvoiceForJob = async (jobId: string) => {
  const invoice = await invoiceRepository.getInvoiceByJobId(jobId);
  return invoice ? toInvoiceDto(invoice) : null;
};

const getInvoiceByJobId = async (jobId: string, role?: ActorRole) => {
  requireBillingRole(role);
  return findInvoiceForJob(jobId);
};

const isInvoicePaid = (invoice?: { status?: InvoiceStatus } | null) =>
  invoice?.status === INVOICE_STATUS.PAID;

const jobHasPaidInvoice = async (jobId: string) =>
  isInvoicePaid(await findInvoiceForJob(jobId));

const moveJobToInvoiced = async (jobId: string) => {
  const job = await jobRepository.getJobById(jobId);

  if (!job || job.status !== JOB_STATUS.READY_FOR_COLLECTION) {
    return;
  }

  await jobRepository.updateJobStatus(jobId, JOB_STATUS.INVOICED);
  await jobUpdateService.createWorkflowUpdate(jobId, JOB_STATUS.INVOICED);
};

const restoreJobToReadyForCollection = async (jobId: string) => {
  const job = await jobRepository.getJobById(jobId);

  if (!job || job.status !== JOB_STATUS.INVOICED) {
    return;
  }

  await jobRepository.updateJobStatus(jobId, JOB_STATUS.READY_FOR_COLLECTION);
};

const generateDraft = async (
  command: GenerateInvoiceDto,
  role?: ActorRole,
  actorId?: string,
) => {
  requireBillingRole(role);

  const existingInvoice = await invoiceRepository.getInvoiceByJobId(
    command.job_id,
  );

  if (existingInvoice && existingInvoice.status !== INVOICE_STATUS.VOID) {
    await moveJobToInvoiced(command.job_id);
    return toInvoiceDto(existingInvoice);
  }

  if (existingInvoice?.status === INVOICE_STATUS.VOID) {
    await invoiceRepository.deleteInvoiceById(existingInvoice.id);
  }

  const job = await jobRepository.getJobById(command.job_id);

  if (!job) {
    throw new AppError("Job not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (!isInvoiceEligibleStatus(job.status as JobStatus)) {
    throw new AppError(
      "An invoice can only be generated once the job is ready for collection",
      409,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const workItems = await workItemRepository.getWorkItemsByJobId(command.job_id);

  if (workItems.length === 0) {
    throw new AppError(
      "Add at least one work item before generating an invoice",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const vehicle = firstRelation(job.vehicles);
  const customer = firstRelation(vehicle?.customers);

  if (!vehicle || !customer) {
    throw new AppError(
      "Job customer and vehicle details are required",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const lines: Omit<CreateInvoiceLineData, "invoice_id">[] = workItems.map(
    (item: any) => ({
      source_work_item_id: item.id,
      kind: item.kind,
      origin: item.origin,
      description: item.description,
      quantity: money(item.quantity),
      unit_price: money(item.unit_price),
      line_total: money(Number(item.quantity) * Number(item.unit_price)),
      sort_order: item.sort_order ?? 0,
    }),
  );
  const subtotal = money(
    lines.reduce((sum: number, line: any) => sum + line.line_total, 0),
  );
  const discount = 0;
  const vat = money(((subtotal - discount) * VAT_RATE) / 100);
  const total = money(subtotal - discount + vat);
  const depositPaid = job.deposit_received_at
    ? money(Math.min(Number(job.deposit_amount ?? 0), total))
    : 0;
  const invoiceData: CreateInvoiceData = {
    job_id: command.job_id,
    status: INVOICE_STATUS.DRAFT,
    subtotal,
    discount,
    vat_rate: VAT_RATE,
    vat,
    total,
    deposit_paid: depositPaid,
    amount_paid: depositPaid,
    job_number: job.job_number,
    customer_name: `${customer.first_name} ${customer.last_name}`.trim(),
    customer_email: customer.email ?? null,
    customer_phone: customer.phone ?? null,
    vehicle_registration: vehicle.registration,
    vehicle_make: vehicle.make,
    vehicle_model: vehicle.model,
  };

  let invoice: any;

  try {
    invoice = await invoiceRepository.createInvoice(invoiceData);
  } catch (error) {
    const racedInvoice = await invoiceRepository.getInvoiceByJobId(
      command.job_id,
    );

    if (racedInvoice) {
      return toInvoiceDto(racedInvoice);
    }

    throw error;
  }

  try {
    await invoiceRepository.createInvoiceLines(
      lines.map((line) => ({
        ...line,
        invoice_id: invoice.id,
      })),
    );
  } catch (error) {
    await invoiceRepository.deleteInvoiceById(invoice.id);
    throw error;
  }

  await auditRepository.createAuditLog({
    entity_type: "invoice",
    entity_id: invoice.id,
    action: "GENERATE_DRAFT",
    old_value: null,
    new_value: invoiceData,
    created_by: actorId ?? null,
  });

  await moveJobToInvoiced(command.job_id);

  return getInvoiceById(invoice.id, role);
};

const issueInvoice = async (
  id: string,
  role?: ActorRole,
  actorId?: string,
) => {
  requireBillingRole(role);
  const existingInvoice = await invoiceRepository.getInvoiceById(id);

  if (!existingInvoice) {
    throw new AppError("Invoice not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (existingInvoice.status !== INVOICE_STATUS.DRAFT) {
    throw new AppError(
      "Only draft invoices can be issued",
      409,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const now = new Date().toISOString();
  const isFullyPaid = Number(existingInvoice.amount_paid) >= Number(existingInvoice.total);
  const update: UpdateInvoiceData = {
    status: isFullyPaid ? INVOICE_STATUS.PAID : INVOICE_STATUS.UNPAID,
    issued_at: now,
    due_at: now,
    paid_at: isFullyPaid ? now : null,
    updated_at: now,
  };
  const updatedInvoice = await invoiceRepository.updateInvoiceById(
    id,
    update,
  );

  await auditRepository.createAuditLog({
    entity_type: "invoice",
    entity_id: id,
    action: "ISSUE",
    old_value: existingInvoice,
    new_value: updatedInvoice,
    created_by: actorId ?? null,
  });

  await jobUpdateService.createBillingUpdate(
    existingInvoice.job_id,
    "Invoice sent",
    existingInvoice.invoice_number,
  );

  await moveJobToInvoiced(existingInvoice.job_id);

  if (isFullyPaid) {
    await jobUpdateService.createBillingUpdate(
      existingInvoice.job_id,
      "Invoice paid",
      existingInvoice.invoice_number,
    );
  }

  return getInvoiceById(id, role);
};

const markInvoicePaid = async (
  id: string,
  role?: ActorRole,
  actorId?: string,
) => {
  requireBillingRole(role);
  const existingInvoice = await invoiceRepository.getInvoiceById(id);

  if (!existingInvoice) {
    throw new AppError("Invoice not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (existingInvoice.status !== INVOICE_STATUS.UNPAID) {
    throw new AppError(
      "Only unpaid invoices can be marked paid",
      409,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const now = new Date().toISOString();
  const updatedInvoice = await invoiceRepository.updateInvoiceById(id, {
    status: INVOICE_STATUS.PAID,
    amount_paid: money(existingInvoice.total),
    paid_at: now,
    updated_at: now,
  });

  await auditRepository.createAuditLog({
    entity_type: "invoice",
    entity_id: id,
    action: "MARK_PAID",
    old_value: existingInvoice,
    new_value: updatedInvoice,
    created_by: actorId ?? null,
  });

  await jobUpdateService.createBillingUpdate(
    existingInvoice.job_id,
    "Invoice paid",
    existingInvoice.invoice_number,
  );

  return getInvoiceById(id, role);
};

const voidInvoice = async (
  id: string,
  role?: ActorRole,
  actorId?: string,
) => {
  requireBillingRole(role);
  const existingInvoice = await invoiceRepository.getInvoiceById(id);

  if (!existingInvoice) {
    throw new AppError("Invoice not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (
    existingInvoice.status !== INVOICE_STATUS.DRAFT &&
    existingInvoice.status !== INVOICE_STATUS.UNPAID
  ) {
    throw new AppError(
      "Only draft or unpaid invoices can be voided",
      409,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const now = new Date().toISOString();
  const updatedInvoice = await invoiceRepository.updateInvoiceById(id, {
    status: INVOICE_STATUS.VOID,
    voided_at: now,
    updated_at: now,
  });

  await auditRepository.createAuditLog({
    entity_type: "invoice",
    entity_id: id,
    action: "VOID",
    old_value: existingInvoice,
    new_value: updatedInvoice,
    created_by: actorId ?? null,
  });

  await jobUpdateService.createBillingUpdate(
    existingInvoice.job_id,
    "Invoice voided",
    existingInvoice.invoice_number,
  );

  await restoreJobToReadyForCollection(existingInvoice.job_id);

  return getInvoiceById(id, role);
};

export { getInvoices, getInvoiceById, getInvoiceByJobId, findInvoiceForJob, generateDraft, issueInvoice, markInvoicePaid, voidInvoice, toInvoiceDto, isInvoiceEligibleStatus, isInvoiceConfirmed, isInvoicePaid, jobHasPaidInvoice };
