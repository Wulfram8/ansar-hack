import { useList } from "@refinedev/core";

export interface Role {
  id: string;
  code: string;
  name: string;
}

export function useRoles() {
  const { data } = useList<Role>({ resource: "roles", pagination: { mode: "off" } });
  return data?.data ?? [];
}
