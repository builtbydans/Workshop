import supabase from "../../../config/db/supabase";
import { AppError } from "../../../errors/AppError";
import { CreateJobUpdateDto } from "../../../types/job-update.types";

const createJobUpdate = async (jobUpdateData: CreateJobUpdateDto) => {
  const { data, error } = await supabase
    .from("job_updates")
    .insert(jobUpdateData)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

const getJobUpdatesByJobId = async (jobId: string) => {
  const { data, error } = await supabase
    .from("job_updates")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

export { createJobUpdate, getJobUpdatesByJobId };
