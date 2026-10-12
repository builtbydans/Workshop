import supabase from "../../../config/db/supabase";
import { AppError } from "../../../errors/AppError";

const RAISE_SELECT = `
  id,
  job_id,
  status,
  created_at,
  updated_at,
  acknowledged_at,
  resolved_at,
  raised_by:employees!raised_by_employee_id (
    id,
    first_name,
    last_name
  ),
  notes:job_raise_notes (
    id,
    body,
    created_at,
    employee:employees!employee_id (
      id,
      first_name,
      last_name
    )
  )
`;

const getOpenRaiseByJobId = async (jobId: string) => {
  const { data, error } = await supabase
    .from("job_raises")
    .select(RAISE_SELECT)
    .eq("job_id", jobId)
    .eq("status", "OPEN")
    .order("created_at", {
      referencedTable: "job_raise_notes",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

const getOpenRaisesByJobIds = async (jobIds: string[]) => {
  if (jobIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("job_raises")
    .select(RAISE_SELECT)
    .in("job_id", jobIds)
    .eq("status", "OPEN")
    .order("created_at", {
      referencedTable: "job_raise_notes",
      ascending: true,
    });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data ?? [];
};

const getRaiseById = async (id: string) => {
  const { data, error } = await supabase
    .from("job_raises")
    .select(RAISE_SELECT)
    .eq("id", id)
    .order("created_at", {
      referencedTable: "job_raise_notes",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

const getOpenRaisesForDashboard = async () => {
  const { data, error } = await supabase
    .from("job_raises")
    .select(
      `
      id,
      job_id,
      status,
      created_at,
      updated_at,
      raised_by:employees!raised_by_employee_id (
        id,
        first_name,
        last_name
      ),
      notes:job_raise_notes (
        id,
        body,
        created_at
      ),
      jobs!inner (
        id,
        job_number,
        status,
        deleted_at,
        vehicles (
          registration,
          make,
          model
        )
      )
    `,
    )
    .eq("status", "OPEN")
    .is("jobs.deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data ?? [];
};

const createRaise = async (jobId: string, employeeId: string) => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("job_raises")
    .insert({
      job_id: jobId,
      raised_by_employee_id: employeeId,
      status: "OPEN",
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return null;
    }

    throw new AppError(error.message, 500);
  }

  return data;
};

const addNote = async (raiseId: string, employeeId: string, body: string) => {
  const { data, error } = await supabase
    .from("job_raise_notes")
    .insert({
      raise_id: raiseId,
      employee_id: employeeId,
      body,
    })
    .select("id")
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

const touchRaise = async (raiseId: string) => {
  const { error } = await supabase
    .from("job_raises")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", raiseId);

  if (error) {
    throw new AppError(error.message, 500);
  }
};

const acknowledgeRaise = async (
  raiseId: string,
  employeeId?: string,
) => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("job_raises")
    .update({
      status: "ACKNOWLEDGED",
      acknowledged_at: now,
      acknowledged_by_employee_id: employeeId ?? null,
      updated_at: now,
    })
    .eq("id", raiseId)
    .eq("status", "OPEN");

  if (error) {
    throw new AppError(error.message, 500);
  }
};

const resolveRaise = async (raiseId: string, employeeId?: string) => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("job_raises")
    .update({
      status: "RESOLVED",
      resolved_at: now,
      resolved_by_employee_id: employeeId ?? null,
      updated_at: now,
    })
    .eq("id", raiseId)
    .eq("status", "OPEN");

  if (error) {
    throw new AppError(error.message, 500);
  }
};

export { getOpenRaiseByJobId, getOpenRaisesByJobIds, getRaiseById, getOpenRaisesForDashboard, createRaise, addNote, touchRaise, acknowledgeRaise, resolveRaise };
