import supabase from "../../config/db/supabase";
import { AppError } from "../../errors/AppError";

const createAuditLog = async (auditData: any) => {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert(auditData)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

export { createAuditLog };
