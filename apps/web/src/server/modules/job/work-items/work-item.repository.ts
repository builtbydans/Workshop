import supabase from "../../../config/db/supabase";
import { AppError } from "../../../errors/AppError";
import type {
  CreateWorkItemDto,
  UpdateWorkItemDto,
} from "../../../types/work-item.types";

const getWorkItemsByJobId = async (jobId: string) => {
  const { data, error } = await supabase
    .from("work_items")
    .select("*")
    .eq("job_id", jobId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data ?? [];
};

const getWorkItemById = async (id: string) => {
  const { data, error } = await supabase
    .from("work_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

const getNextSortOrder = async (jobId: string) => {
  const { data, error } = await supabase
    .from("work_items")
    .select("sort_order")
    .eq("job_id", jobId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data?.sort_order ?? -1) + 1;
};

const createWorkItem = async (
  jobId: string,
  item: CreateWorkItemDto,
  employeeId?: string,
) => {
  const sortOrder = await getNextSortOrder(jobId);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("work_items")
    .insert({
      job_id: jobId,
      kind: item.kind,
      origin: item.origin ?? "QUOTED",
      description: item.description,
      quantity: item.quantity,
      unit_cost: item.unit_cost ?? 0,
      unit_price: item.unit_price,
      sort_order: sortOrder,
      created_by_employee_id: employeeId ?? null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

const updateWorkItem = async (id: string, item: UpdateWorkItemDto) => {
  const { data, error } = await supabase
    .from("work_items")
    .update({
      ...item,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

const deleteWorkItem = async (id: string) => {
  const { error } = await supabase.from("work_items").delete().eq("id", id);

  if (error) {
    throw new AppError(error.message, 500);
  }
};

export { getWorkItemsByJobId, getWorkItemById, createWorkItem, updateWorkItem, deleteWorkItem };
