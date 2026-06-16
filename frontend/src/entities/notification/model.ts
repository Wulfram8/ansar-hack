export type TriggerKind =
  | "BEFORE_APPOINTMENT"
  | "AFTER_APPOINTMENT"
  | "AFTER_CANCEL"
  | "FOLLOWUP_DUE"
  | "CUSTOM";

export type ScheduledStatus = "PENDING" | "SENT" | "FAILED" | "CANCELLED";

export interface NotificationTemplate {
  id: string;
  code: string;
  title: string;
  body: string;
  channels?: string[];
  variables?: string[];
  is_active: boolean;
  rules_count?: number;
}

export interface AutomationRule {
  id: string;
  template: string;
  template_title?: string | null;
  trigger_kind: TriggerKind;
  trigger_display?: string;
  offset_minutes: number;
  conditions?: Record<string, unknown>;
  is_active: boolean;
}

export interface ScheduledNotification {
  id: string;
  rule: string;
  patient: string;
  patient_name?: string | null;
  template_title?: string | null;
  appointment?: string | null;
  send_at: string;
  channel: string;
  channel_code?: string | null;
  status: ScheduledStatus;
  payload?: Record<string, unknown>;
  attempts: number;
  last_error?: string;
}

export const TRIGGER_KIND_LABELS: Record<TriggerKind, string> = {
  BEFORE_APPOINTMENT: "До приёма",
  AFTER_APPOINTMENT: "После приёма",
  AFTER_CANCEL: "После отмены",
  FOLLOWUP_DUE: "Повторный визит",
  CUSTOM: "Произвольный",
};

export const SCHEDULED_STATUS_LABELS: Record<ScheduledStatus, string> = {
  PENDING: "Ожидает",
  SENT: "Отправлено",
  FAILED: "Ошибка",
  CANCELLED: "Отменено",
};
