export type RoleCode = "ADMIN" | "DOCTOR" | "MANAGER";

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string | null;
  role?: Role | null;
  is_active: boolean;
}

export const ROLE_LABELS: Record<RoleCode, string> = {
  ADMIN: "Администратор",
  DOCTOR: "Врач",
  MANAGER: "Менеджер",
};
