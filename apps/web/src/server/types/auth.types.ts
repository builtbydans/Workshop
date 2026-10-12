export interface AuthContext {
  userId: string;
  email: string;
  role?: "MANAGER" | "ADMIN" | "TECHNICIAN";
  employeeId?: string;
}
