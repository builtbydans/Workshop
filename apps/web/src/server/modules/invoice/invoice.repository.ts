import {
  CreateInvoiceLineData,
  CreateInvoiceData,
  UpdateInvoiceData,
} from "../../types/invoice.types";

import supabase from "../../config/db/supabase";

const INVOICE_SELECT = `
  *,
  lines:invoice_lines (
    id,
    source_work_item_id,
    kind,
    origin,
    description,
    quantity,
    unit_price,
    line_total,
    sort_order,
    created_at
  )
`;

const getInvoices = async () => {
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getInvoiceById = async (id: string) => {
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT)
    .eq("id", id)
    .order("sort_order", {
      referencedTable: "invoice_lines",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getInvoiceByJobId = async (jobId: string) => {
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT)
    .eq("job_id", jobId)
    .order("sort_order", {
      referencedTable: "invoice_lines",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createInvoice = async (invoiceData: CreateInvoiceData) => {
  const { data, error } = await supabase
    .from("invoices")
    .insert(invoiceData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createInvoiceLines = async (lines: CreateInvoiceLineData[]) => {
  if (lines.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("invoice_lines")
    .insert(lines)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

const updateInvoiceById = async (
  id: string,
  updatedData: UpdateInvoiceData,
) => {
  const { data, error } = await supabase
    .from("invoices")
    .update(updatedData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const deleteInvoiceById = async (id: string) => {
  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export { getInvoices, getInvoiceById, getInvoiceByJobId, createInvoice, createInvoiceLines, updateInvoiceById, deleteInvoiceById };
