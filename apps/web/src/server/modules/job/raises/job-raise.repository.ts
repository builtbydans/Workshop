import supabase from "../../../config/db/supabase";
import { AppError } from "../../../errors/AppError";

const OUTSTANDING_STATUSES = ["OPEN", "ACKNOWLEDGED"] as const;

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
    .in("status", [...OUTSTANDING_STATUSES])
    .order("updated_at", { ascending: false })
    .order("created_at", {
      referencedTable: "job_raise_notes",
      ascending: true,
    })
    .limit(1)
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
    .in("status", [...OUTSTANDING_STATUSES])
    .order("created_at", {
      referencedTable: "job_raise_notes",
      ascending: true,
    });

  if (error) {
    throw new AppError(error.message, 500);
  }

  const raises = data ?? [];
  const latestByJobId = new Map<string, (typeof raises)[number]>();

  for (const raise of raises) {
    const existing = latestByJobId.get(raise.job_id);

    if (
      !existing ||
      raise.updated_at.localeCompare(existing.updated_at) > 0
    ) {
      latestByJobId.set(raise.job_id, raise);
    }
  }

  return [...latestByJobId.values()];
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
      acknowledged_at,
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
    .in("status", [...OUTSTANDING_STATUSES])
    .is("jobs.deleted_at", null)
    .order("updated_at", { ascending: false })
    .order("created_at", {
      referencedTable: "job_raise_notes",
      ascending: true,
    });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data ?? [];
};

const countOutstandingRaises = async () => {
  const { count, error } = await supabase
    .from("job_raises")
    .select("id, jobs!inner(deleted_at)", { count: "exact", head: true })
    .in("status", [...OUTSTANDING_STATUSES])
    .is("jobs.deleted_at", null);

  if (error) {
    throw new AppError(error.message, 500);
  }

  return count ?? 0;
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
    .in("status", [...OUTSTANDING_STATUSES]);

  if (error) {
    throw new AppError(error.message, 500);
  }
};

export {
  getOpenRaiseByJobId,
  getOpenRaisesByJobIds,
  getRaiseById,
  getOpenRaisesForDashboard,
  countOutstandingRaises,
  createRaise,
  addNote,
  touchRaise,
  acknowledgeRaise,
  resolveRaise,
};
