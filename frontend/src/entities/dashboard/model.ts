export type DeltaDirection = "up" | "down";

export interface DashboardKpi {
  key: string;
  label: string;
  value: string;
  delta: number;
  delta_direction: DeltaDirection;
}

export interface RevenuePoint {
  month: string;
  plan: number;
  fact: number;
}

export interface PatientSourceSlice {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export interface DoctorLoadRow {
  name: string;
  specialty: string;
  appointments: number;
  revenue_kopecks: number;
}

export interface TopServiceRow {
  title: string;
  count: number;
  revenue_kopecks: number;
  percent: number;
}

export interface Dashboard {
  period_label: string;
  patient_sources_total: number;
  kpis: DashboardKpi[];
  revenue_by_month: RevenuePoint[];
  patient_sources: PatientSourceSlice[];
  doctor_load: DoctorLoadRow[];
  top_services: TopServiceRow[];
}
