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
  /** Развёрнутые поля (read-only, отдаёт бэкенд для карточки). */
  service_interest_title?: string | null;
  source_title?: string | null;
  assigned_admin_name?: string | null;
  assigned_admin_initials?: string | null;
  hot?: boolean;
}

/** Подписи стадий воронки — по дизайну Канбана (ZcbMF). */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новые",
  CONTACTED: "Контакт установлен",
  INTERESTED: "Заинтересован",
  APPOINTMENT_BOOKED: "Записан на прием",
  LOST: "Отказ",
};

/** Цвет точки-маркера колонки. */
export const LEAD_STATUS_DOT: Record<LeadStatus, string> = {
  NEW: "#3b82f6",
  CONTACTED: "#a855f7",
  INTERESTED: "#eab308",
  APPOINTMENT_BOOKED: "#22c55e",
  LOST: "#ef4444",
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

/** Имя иконки lucide для канала лида. */
export const LEAD_CHANNEL_ICON: Record<LeadChannel, string> = {
  SITE: "globe",
  CALL: "phone",
  WHATSAPP: "message-circle",
  TELEGRAM: "send",
  EMAIL: "mail",
  INSTAGRAM: "instagram",
  OTHER: "circle",
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
