import { useList } from "@refinedev/core";
import type { PatientSource, PatientTag } from "@/entities/patient";

/** Справочники для фильтров и формы пациента (источники и теги). */
export function usePatientSources() {
  const { data } = useList<PatientSource>({
    resource: "patient-sources",
    pagination: { mode: "off" },
  });
  return data?.data ?? [];
}

export function usePatientTags() {
  const { data } = useList<PatientTag>({
    resource: "patient-tags",
    pagination: { mode: "off" },
  });
  return data?.data ?? [];
}
