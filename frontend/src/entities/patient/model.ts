export type PatientStatus =
  | "NEW"
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED"
  | "BLOCKED";

export interface PatientSource {
  id: string;
  code: string;
  title: string;
}

export interface PatientTag {
  id: string;
  label: string;
  color: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  birth_date?: string | null;
  gender?: string;
  phone: string;
  email?: string;
  address?: string;
  source?: string | null;
  status: PatientStatus;
  tags?: string[];
  last_visit_date?: string | null;
  next_visit_date?: string | null;
  notes?: string;
  total_revenue_kopecks: number;
  visits_count: number;
  average_check_kopecks: number;
  lifetime_value_kopecks: number;
  /** Развёрнутые связи (read-only, отдаёт бэкенд для таблицы). */
  source_detail?: PatientSource | null;
  tags_detail?: PatientTag[];
  created_at?: string;
  updated_at?: string;
}

export type TimelineEventType =
  | "CREATED"
  | "CALL"
  | "LEAD"
  | "APPOINTMENT_BOOKED"
  | "APPOINTMENT_COMPLETED"
  | "NOTIFICATION_SENT"
  | "CAMPAIGN_RECEIVED"
  | "NOTE";

export interface PatientTimelineEvent {
  id: number;
  patient: string;
  type: TimelineEventType;
  payload: Record<string, unknown>;
  actor?: string | null;
  created_at: string;
}

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  NEW: "Новый",
  ACTIVE: "Активный",
  INACTIVE: "Неактивный",
  ARCHIVED: "В архиве",
  BLOCKED: "Заблокирован",
};

export const PATIENT_STATUS_VARIANTS: Record<
  PatientStatus,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  NEW: "default",
  ACTIVE: "success",
  INACTIVE: "secondary",
  ARCHIVED: "outline",
  BLOCKED: "destructive",
};

export function patientFullName(p: Pick<Patient, "first_name" | "last_name" | "middle_name">): string {
  return [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");
}

export function patientInitials(p: Pick<Patient, "first_name" | "last_name">): string {
  return [p.last_name?.[0], p.first_name?.[0]].filter(Boolean).join("").toUpperCase();
}
