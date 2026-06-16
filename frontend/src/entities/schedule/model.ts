export interface ScheduleBlock {
  start: string;
  end: string;
  left_pct: number;
  width_pct: number;
  patient: string | null;
  service: string | null;
  status: string;
}

export interface DayCell {
  date: string;
  is_off: boolean;
  off_label: string | null;
  blocks: ScheduleBlock[];
}

export interface DoctorRow {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  color: string;
  load_percent: number;
  days: DayCell[];
}

export interface DayHeader {
  weekday: string;
  date_label: string;
  date: string;
  is_today: boolean;
}

export interface FreeSlotDay {
  label: string;
  count: number;
}

export interface LoadBar {
  initials: string;
  percent: number;
  color: string;
}

export interface TimeOff {
  name: string;
  detail: string;
  kind: string;
  color: string;
}

export interface ScheduleBoard {
  week_label: string;
  week_start: string;
  day_headers: DayHeader[];
  doctors: DoctorRow[];
  free_slots_total: number;
  free_slots_delta: number;
  free_slots_by_day: FreeSlotDay[];
  load_avg: number;
  load_bars: LoadBar[];
  time_off: TimeOff[];
}
