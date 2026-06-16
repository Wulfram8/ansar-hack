import { useList } from "@refinedev/core";
import type { PatientSource } from "@/entities/patient";

export interface AdminUser {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

/** Источники для фильтра лидов (переиспользуем справочник пациентов). */
export function useLeadSources() {
  const { data } = useList<PatientSource>({
    resource: "patient-sources",
    pagination: { mode: "off" },
  });
  return data?.data ?? [];
}

/** Список администраторов/ответственных для фильтра. */
export function useAdmins() {
  const { data } = useList<AdminUser>({
    resource: "users",
    pagination: { mode: "off" },
  });
  return data?.data ?? [];
}

export interface ServiceLite {
  id: string;
  title: string;
  price_kopecks: number;
  duration_min: number;
}

/** Список услуг (для интереса лида и формы записи). */
export function useServices() {
  const { data } = useList<ServiceLite>({
    resource: "services",
    pagination: { mode: "off" },
  });
  return data?.data ?? [];
}
