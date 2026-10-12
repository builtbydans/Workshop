export type NavUserRole = "MANAGER" | "ADMIN" | "TECHNICIAN";

export type NavUserData = {
  firstName: string;
  fullName: string;
  email: string;
  avatar: string;
  role?: NavUserRole;
};
