export type LeadChannel =
  | "SITE"
  | "CALL"
  | "WHATSAPP"
  | "TELEGRAM"
  | "EMAIL"
  | "INSTAGRAM"
  | "OTHER";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "APPOINTMENT_BOOKED"
  | "LOST";

export interface Lead {
  id: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  source?: string | null;
  channel: LeadChannel;
  status: LeadStatus;
  assigned_admin?: string | null;
  estimated_value_kopecks: number;
  service_interest?: string | null;
  utm?: Record<string, unknown>;
  lost_reason?: string;
  due_at?: string | null;
  notes?: string;
  converted_patient?: string | null;
  converted_appointment?: string | null;
  created_at?: string;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новый",
  CONTACTED: "На связи",
  INTERESTED: "Заинтересован",
  APPOINTMENT_BOOKED: "Записан",
  LOST: "Потерян",
};

export const LEAD_CHANNEL_LABELS: Record<LeadChannel, string> = {
  SITE: "Сайт",
  CALL: "Телефон",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  EMAIL: "Email",
  INSTAGRAM: "Instagram",
  OTHER: "Другое",
};

/** Порядок стадий воронки для Канбан-доски. */
export const LEAD_PIPELINE: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "APPOINTMENT_BOOKED",
  "LOST",
];

export const LEAD_STATUS_VARIANTS: Record<
  LeadStatus,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  NEW: "default",
  CONTACTED: "secondary",
  INTERESTED: "warning",
  APPOINTMENT_BOOKED: "success",
  LOST: "destructive",
};
