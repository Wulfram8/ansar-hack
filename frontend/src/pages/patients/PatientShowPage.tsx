import { useState } from "react";
import { useShow, useNavigation } from "@refinedev/core";
import {
  ArrowLeft,
  Pencil,
  CalendarCheck,
  MessageSquare,
  UserPlus,
  Activity,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/ui";
import {
  type Patient,
  PATIENT_STATUS_LABELS,
  PATIENT_STATUS_VARIANTS,
  patientFullName,
} from "@/entities/patient";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_VARIANTS,
} from "@/entities/appointment";
import { formatDate, formatDateTime, formatMoneyKopecks } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";
import { usePatientHistory } from "./usePatientHistory";

const TIMELINE_LABELS: Record<string, string> = {
  CREATED: "Пациент создан",
  CALL: "Звонок",
  LEAD: "Заявка",
  APPOINTMENT_BOOKED: "Запись на приём",
  APPOINTMENT_COMPLETED: "Приём завершён",
  NOTIFICATION_SENT: "Уведомление отправлено",
  CAMPAIGN_RECEIVED: "Получена рассылка",
  NOTE: "Заметка",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

type TabKey = "timeline" | "appointments" | "calls" | "messages" | "leads";

export function PatientShowPage() {
  const { list, edit } = useNavigation();
  const { queryResult } = useShow<Patient>({ resource: "patients" });
  const { data, isLoading } = queryResult;
  const patient = data?.data as Patient | undefined;
  const { data: historyData, isLoading: historyLoading } = usePatientHistory(
    patient?.id ? String(patient.id) : undefined,
  );
  const history = historyData?.data;
  const [tab, setTab] = useState<TabKey>("timeline");

  if (isLoading || !patient) {
    return <Skeleton className="h-64 w-full max-w-3xl" />;
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "timeline", label: "Таймлайн", count: history?.timeline.length },
    { key: "appointments", label: "Приёмы", count: history?.appointments.length },
    { key: "calls", label: "Звонки", count: history?.calls.length },
    { key: "messages", label: "Сообщения", count: history?.messages.length },
    { key: "leads", label: "Заявки", count: history?.leads.length },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => list("patients")}>
          <ArrowLeft className="h-4 w-4" /> К списку
        </Button>
        <Button size="sm" onClick={() => edit("patients", patient.id)}>
          <Pencil className="h-4 w-4" /> Редактировать
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{patientFullName(patient)}</CardTitle>
          <Badge variant={PATIENT_STATUS_VARIANTS[patient.status]}>
            {PATIENT_STATUS_LABELS[patient.status]}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Field label="Телефон" value={patient.phone} />
          <Field label="Email" value={patient.email} />
          <Field label="Дата рождения" value={formatDate(patient.birth_date)} />
          <Field label="Адрес" value={patient.address} />
          <Field label="Последний визит" value={formatDate(patient.last_visit_date)} />
          <Field label="Следующий визит" value={formatDate(patient.next_visit_date)} />
          <Field label="Визитов" value={patient.visits_count} />
          <Field label="Средний чек" value={formatMoneyKopecks(patient.average_check_kopecks)} />
          <Field label="Выручка" value={formatMoneyKopecks(patient.total_revenue_kopecks)} />
        </CardContent>
      </Card>

      {patient.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Заметки сотрудников</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{patient.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* История */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">История активности</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="inline-flex flex-wrap gap-1 rounded-md bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {typeof t.count === "number" && (
                  <span className="ml-1.5 text-xs text-muted-foreground">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {historyLoading && <Skeleton className="h-24 w-full" />}

          {!historyLoading && history && (
            <div className="pt-1">
              {tab === "timeline" && (
                <div className="space-y-3">
                  {history.timeline.length === 0 && <Empty />}
                  {history.timeline.map((e) => (
                    <div key={e.id} className="flex gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">
                          {TIMELINE_LABELS[e.type] ?? e.type}
                        </div>
                        {typeof e.payload?.note === "string" && (
                          <div className="text-sm text-muted-foreground">{e.payload.note}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(e.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "appointments" && (
                <div className="space-y-2">
                  {history.appointments.length === 0 && <Empty />}
                  {history.appointments.map((a) => (
                    <Row
                      key={a.id}
                      icon={<CalendarCheck className="h-4 w-4 text-blue-600" />}
                      title={a.service_title ?? "Приём"}
                      subtitle={`${a.doctor_name ?? "—"}${a.cabinet ? ` · каб. ${a.cabinet}` : ""}`}
                      meta={`${formatDate(a.date)} · ${a.start_time?.slice(0, 5)}–${a.end_time?.slice(0, 5)}`}
                      badge={
                        <Badge variant={APPOINTMENT_STATUS_VARIANTS[a.status]}>
                          {APPOINTMENT_STATUS_LABELS[a.status]}
                        </Badge>
                      }
                    />
                  ))}
                </div>
              )}

              {tab === "calls" && (
                <div className="space-y-2">
                  {history.calls.length === 0 && <Empty />}
                  {history.calls.map((c) => (
                    <Row
                      key={c.id}
                      icon={
                        c.direction === "IN" ? (
                          <PhoneIncoming className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <PhoneOutgoing className="h-4 w-4 text-blue-600" />
                        )
                      }
                      title={c.direction === "IN" ? "Входящий звонок" : "Исходящий звонок"}
                      subtitle={c.transcript || `Длительность: ${Math.round(c.duration_sec / 60)} мин`}
                      meta={formatDateTime(c.started_at)}
                      badge={<Badge variant="secondary">{c.result}</Badge>}
                    />
                  ))}
                </div>
              )}

              {tab === "messages" && (
                <div className="space-y-2">
                  {history.messages.length === 0 && <Empty />}
                  {history.messages.map((m) => (
                    <Row
                      key={m.id}
                      icon={<MessageSquare className="h-4 w-4 text-violet-600" />}
                      title={`${m.channel ?? "Сообщение"}${m.subject ? ` · ${m.subject}` : ""}`}
                      subtitle={m.body}
                      meta={formatDateTime(m.sent_at ?? m.created_at)}
                      badge={<Badge variant="secondary">{m.status}</Badge>}
                    />
                  ))}
                </div>
              )}

              {tab === "leads" && (
                <div className="space-y-2">
                  {history.leads.length === 0 && <Empty />}
                  {history.leads.map((l) => (
                    <Row
                      key={l.id}
                      icon={<UserPlus className="h-4 w-4 text-amber-600" />}
                      title={`Заявка · ${l.channel}`}
                      subtitle={formatMoneyKopecks(l.estimated_value_kopecks)}
                      meta={formatDateTime(l.created_at)}
                      badge={<Badge variant="secondary">{l.status}</Badge>}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Empty() {
  return <p className="py-6 text-center text-sm text-muted-foreground/70">Нет данных</p>;
}

function Row({
  icon,
  title,
  subtitle,
  meta,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  meta: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <div className="shrink-0 text-right">
        {badge}
        <div className="mt-0.5 text-xs text-muted-foreground">{meta}</div>
      </div>
    </div>
  );
}
