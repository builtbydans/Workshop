import type { EmployeeDto } from "@/types/employee.types";

const STORAGE_KEY = "workshop-session";

export type WorkshopSession = {
  token: string;
  employee: Pick<EmployeeDto, "id" | "first_name" | "last_name" | "role">;
};

export const getWorkshopSession = (): WorkshopSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkshopSession) : null;
  } catch {
    return null;
  }
};

export const setWorkshopSession = (session: WorkshopSession) => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearWorkshopSession = () => {
  window.sessionStorage.removeItem(STORAGE_KEY);
};
