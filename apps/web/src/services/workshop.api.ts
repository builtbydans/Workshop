import { API_URL } from "@/config/api";
import { ApiError } from "@/lib/api-error";
import { createApiFetch } from "@/lib/create-api-fetch";
import {
  clearWorkshopSession,
  getWorkshopSession,
} from "@/lib/workshop-session";
import type { EmployeeDto, WorkshopTechnicianDto } from "@/types/employee.types";
import { createJobService } from "@/services/job.api";

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchWorkshopTechnicians() {
  const response = await fetch(`${API_URL}/workshop/technicians`, {
    method: "GET",
    cache: "no-store",
  });
  const payload = await readJson(response);

  if (
    !response.ok ||
    !payload ||
    typeof payload !== "object" ||
    !("success" in payload) ||
    payload.success !== true
  ) {
    throw new ApiError(
      "Unable to load technicians",
      response.status,
      "INTERNAL_SERVER_ERROR",
    );
  }

  return (payload as unknown as { data: WorkshopTechnicianDto[] }).data;
}

export async function clockInTechnician(employeeId: string, pin: string) {
  const response = await fetch(`${API_URL}/workshop/clock-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, pin }),
  });
  const payload = await readJson(response);

  if (
    !response.ok ||
    !payload ||
    typeof payload !== "object" ||
    !("success" in payload) ||
    payload.success !== true
  ) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Invalid PIN";

    throw new ApiError(message, response.status, "UNAUTHORIZED");
  }

  return (
    payload as unknown as {
      data: { token: string; employee: EmployeeDto };
    }
  ).data;
}

const workshopApiFetch = createApiFetch(async () => {
  return getWorkshopSession()?.token ?? null;
}, () => {
  clearWorkshopSession();

  if (typeof window !== "undefined") {
    window.location.assign("/technician/login");
  }
});

export const {
  getJobs: getWorkshopJobs,
  getJobById: getWorkshopJobById,
  transitionJob: transitionWorkshopJob,
  raiseToManager: raiseWorkshopJob,
  createWorkItem: createWorkshopWorkItem,
  deleteWorkItem: deleteWorkshopWorkItem,
} = createJobService(workshopApiFetch);
