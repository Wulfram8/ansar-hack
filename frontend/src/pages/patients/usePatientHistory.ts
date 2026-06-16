import { useCustom, useApiUrl } from "@refinedev/core";
import type { AppointmentStatus } from "@/entities/appointment";
import type { TimelineEventType } from "@/entities/patient";

export interface HistoryTimelineEvent {
  id: number;
  type: TimelineEventType;
  payload: Record<string, unknown>;
  created_at: string;
}
export interface HistoryAppointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  doctor_name?: string | null;
  service_title?: string | null;
  cabinet?: string;
}
export interface HistoryCall {
  id: string;
  direction: "IN" | "OUT";
  duration_sec: number;
  result: string;
  transcript: string;
  started_at: string;
}
export interface HistoryMessage {
  id: string;
  direction: "IN" | "OUT";
  channel: string | null;
  subject: string;
  body: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}
export interface HistoryLead {
  id: string;
  channel: string;
  status: string;
  estimated_value_kopecks: number;
  created_at: string;
}
export interface PatientHistory {
  timeline: HistoryTimelineEvent[];
  appointments: HistoryAppointment[];
  calls: HistoryCall[];
  messages: HistoryMessage[];
  leads: HistoryLead[];
}

/** Полная история пациента: GET /api/patients/:id/history/. */
export function usePatientHistory(id?: string) {
  const apiUrl = useApiUrl();
  return useCustom<PatientHistory>({
    url: `${apiUrl}/patients/${id}/history/`,
    method: "get",
    queryOptions: { enabled: !!id },
  });
}
