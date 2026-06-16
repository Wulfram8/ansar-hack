export type AppointmentStatus =
  | "CREATED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Service {
  id: string;
  code: string;
  title: string;
  category: string;
  duration_min: number;
  price_kopecks: number;
  color_hex: string;
}

export interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  service?: string | null;
  cabinet?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  comment?: string;
  source_lead?: string | null;
  recommended_followup_at?: string | null;
  cancel_reason?: string;
  cancelled_at?: string | null;
  created_at?: string;
  /** Развёрнутые поля (read-only, отдаёт бэкенд для таблицы). */
  patient_name?: string | null;
  doctor_name?: string | null;
  service_title?: string | null;
  status_display?: string;
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  CREATED: "Создана",
  CONFIRMED: "Подтверждена",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
  NO_SHOW: "Неявка",
};

export const APPOINTMENT_STATUS_VARIANTS: Record<
  AppointmentStatus,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  CREATED: "secondary",
  CONFIRMED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "warning",
};
