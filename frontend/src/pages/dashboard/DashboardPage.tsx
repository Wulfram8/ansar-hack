import { useMemo } from "react";
import { useList } from "@refinedev/core";
import type { Options } from "highcharts";
import { Users, CalendarClock, Target, Wallet } from "lucide-react";
import { Chart, StatCard } from "@/widgets/dashboard-charts";
import {
  type Patient,
  PATIENT_STATUS_LABELS,
  type PatientStatus,
} from "@/entities/patient";
import {
  type Appointment,
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "@/entities/appointment";
import { type Lead } from "@/entities/lead";
import { formatMoneyKopecks } from "@/shared/lib/utils";

function countBy<T extends string>(items: { status: T }[], keys: T[]) {
  const acc = Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>;
  for (const item of items) acc[item.status] = (acc[item.status] ?? 0) + 1;
  return acc;
}

export function DashboardPage() {
  const { data: patientsData } = useList<Patient>({
    resource: "patients",
    pagination: { mode: "off" },
  });
  const { data: appointmentsData } = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
  });
  const { data: leadsData } = useList<Lead>({
    resource: "leads",
    pagination: { mode: "off" },
  });

  const patients: Patient[] = patientsData?.data ?? [];
  const appointments: Appointment[] = appointmentsData?.data ?? [];
  const leads: Lead[] = leadsData?.data ?? [];

  const revenue = useMemo(
    () => patients.reduce((sum, p) => sum + (p.total_revenue_kopecks ?? 0), 0),
    [patients],
  );

  const patientStatusOptions: Options = useMemo(() => {
    const counts = countBy(
      patients,
      Object.keys(PATIENT_STATUS_LABELS) as PatientStatus[],
    );
    return {
      chart: { type: "pie", height: 280 },
      title: { text: undefined },
      tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
      series: [
        {
          type: "pie",
          name: "Пациенты",
          data: (Object.keys(counts) as PatientStatus[]).map((k) => ({
            name: PATIENT_STATUS_LABELS[k],
            y: counts[k],
          })),
        },
      ],
    };
  }, [patients]);

  const appointmentStatusOptions: Options = useMemo(() => {
    const counts = countBy(
      appointments,
      Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[],
    );
    const keys = Object.keys(counts) as AppointmentStatus[];
    return {
      chart: { type: "column", height: 280 },
      title: { text: undefined },
      xAxis: { categories: keys.map((k) => APPOINTMENT_STATUS_LABELS[k]) },
      yAxis: { title: { text: "Кол-во" }, allowDecimals: false },
      legend: { enabled: false },
      series: [
        {
          type: "column",
          name: "Записи",
          colorByPoint: true,
          data: keys.map((k) => counts[k]),
        },
      ],
    };
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-muted-foreground">Сводка по клинике</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Пациентов" value={patients.length} icon={Users} />
        <StatCard label="Записей" value={appointments.length} icon={CalendarClock} />
        <StatCard label="Лидов" value={leads.length} icon={Target} />
        <StatCard
          label="Выручка"
          value={formatMoneyKopecks(revenue)}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Пациенты по статусам" options={patientStatusOptions} />
        <Chart title="Записи по статусам" options={appointmentStatusOptions} />
      </div>
    </div>
  );
}
