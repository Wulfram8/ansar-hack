import { useMemo, useState } from "react";
import { useShow, useNavigation, useUpdate, useInvalidate } from "@refinedev/core";
import {
  ChevronRight,
  Phone,
  Mail,
  Cake,
  MapPin,
  Instagram,
  UserCheck,
  CalendarPlus,
  Pencil,
  Archive,
  MoreHorizontal,
  Plus,
  Activity,
  Wallet,
  TrendingUp,
  PhoneIncoming,
  PhoneOutgoing,
  CalendarCheck,
  UserPlus,
  Bell,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Skeleton, toastStore } from "@/shared/ui";
import {
  type Patient,
  PATIENT_STATUS_LABELS,
  patientFullName,
  patientInitials,
} from "@/entities/patient";
import {
  APPOINTMENT_STATUS_LABELS,
} from "@/entities/appointment";
import {
  type LeadStatus,
  type LeadChannel,
  LEAD_STATUS_LABELS,
  LEAD_CHANNEL_LABELS,
} from "@/entities/lead";
import { formatMoneyKopecks } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";
import { usePatientHistory, type PatientHistory } from "./usePatientHistory";
import { AppointmentFormDialog } from "@/pages/appointments/AppointmentFormDialog";
import { AddNoteDialog } from "./AddNoteDialog";

type TabKey = "overview" | "visits" | "calls" | "messages" | "leads" | "notes" | "files";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Обзор" },
  { key: "visits", label: "Визиты" },
  { key: "calls", label: "Звонки" },
  { key: "messages", label: "Сообщения" },
  { key: "leads", label: "Заявки" },
  { key: "notes", label: "Назначения" },
  { key: "files", label: "Файлы" },
];

function ageFrom(birth?: string | null): string {
  if (!birth) return "—";
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  const last = a % 10;
  const word = last === 1 && a % 100 !== 11 ? "год" : last >= 2 && last <= 4 && (a % 100 < 10 || a % 100 >= 20) ? "года" : "лет";
  return `${a} ${word}`;
}

function fmtDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })} · ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
}

interface FeedItem {
  key: string;
  title: string;
  sub: string;
  date: string;
  ts: number;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

function buildFeed(h: PatientHistory): FeedItem[] {
  const items: FeedItem[] = [];
  h.timeline.forEach((e) => {
    const map: Record<string, { t: string; c: string; i: FeedItem["icon"] }> = {
      CREATED: { t: "Создан в системе", c: "#1d4ed8", i: UserPlus },
      NOTE: { t: "Комментарий врача", c: "#16a34a", i: FileText },
      CALL: { t: "Звонок", c: "#a855f7", i: PhoneIncoming },
      LEAD: { t: "Оставил(а) заявку", c: "#ea580c", i: UserPlus },
      APPOINTMENT_BOOKED: { t: "Записан(а) на приём", c: "#1d4ed8", i: CalendarCheck },
      APPOINTMENT_COMPLETED: { t: "Посетил(а) врача", c: "#16a34a", i: CalendarCheck },
      NOTIFICATION_SENT: { t: "Получено уведомление", c: "#737373", i: Bell },
      CAMPAIGN_RECEIVED: { t: "Получена рассылка", c: "#737373", i: Bell },
    };
    const m = map[e.type] ?? { t: e.type, c: "#737373", i: Activity };
    const note = typeof e.payload?.note === "string" ? e.payload.note : "";
    items.push({
      key: `t${e.id}`, title: m.t, sub: note || "—", date: fmtDateTime(e.created_at),
      ts: new Date(e.created_at).getTime(), color: m.c, icon: m.i,
    });
  });
  h.appointments.forEach((a) => {
    const completed = a.status === "COMPLETED";
    items.push({
      key: `a${a.id}`,
      title: completed ? "Посетил(а) врача" : "Записан(а) на приём",
      sub: [a.doctor_name, a.service_title].filter(Boolean).join(" · ") || "—",
      date: fmtDateTime(`${a.date}T${a.start_time}`),
      ts: new Date(`${a.date}T${a.start_time}`).getTime(),
      color: completed ? "#16a34a" : "#1d4ed8",
      icon: CalendarCheck,
    });
  });
  h.calls.forEach((c) => {
    items.push({
      key: `c${c.id}`,
      title: c.direction === "IN" ? "Входящий звонок" : "Исходящий звонок",
      sub: c.transcript || `Длительность ${Math.floor(c.duration_sec / 60)}:${String(c.duration_sec % 60).padStart(2, "0")}`,
      date: fmtDateTime(c.started_at), ts: new Date(c.started_at).getTime(),
      color: "#a855f7", icon: c.direction === "IN" ? PhoneIncoming : PhoneOutgoing,
    });
  });
  h.messages.forEach((m) => {
    items.push({
      key: `m${m.id}`, title: `${m.channel ?? "Сообщение"}`,
      sub: m.body || m.subject || "—",
      date: fmtDateTime(m.sent_at ?? m.created_at), ts: new Date(m.sent_at ?? m.created_at).getTime(),
      color: "#737373", icon: Bell,
    });
  });
  h.leads.forEach((l) => {
    items.push({
      key: `l${l.id}`, title: "Оставил(а) заявку",
      sub: `${l.channel} · ${formatMoneyKopecks(l.estimated_value_kopecks)}`,
      date: fmtDateTime(l.created_at), ts: new Date(l.created_at).getTime(),
      color: "#ea580c", icon: UserPlus,
    });
  });
  return items.sort((a, b) => b.ts - a.ts);
}

function InfoRow({ icon: Icon, label, value }: { icon: FeedItem["icon"]; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 leading-tight">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-[13px] font-medium text-foreground">{value || "—"}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: FeedItem["icon"]; color: string }) {
  return (
    <div className="flex-1 rounded-lg border bg-muted/30 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: `${color}1a` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </span>
      </div>
      <div className="mt-1.5 text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}

export function PatientShowPage() {
  const { list, edit } = useNavigation();
  const { queryResult } = useShow<Patient>({ resource: "patients" });
  const { data, isLoading } = queryResult;
  const patient = data?.data as Patient | undefined;
  const invalidate = useInvalidate();
  const { mutate: update } = useUpdate();

  const { data: historyData, isLoading: historyLoading, refetch } = usePatientHistory(
    patient?.id ? String(patient.id) : undefined,
  );
  const history = historyData?.data;

  const [tab, setTab] = useState<TabKey>("overview");
  const [bookOpen, setBookOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const feed = useMemo(() => (history ? buildFeed(history) : []), [history]);
  const treatingDoctor = history?.appointments[0]?.doctor_name ?? "—";
  const noteEvents = useMemo(
    () => (history?.timeline ?? []).filter((e) => e.type === "NOTE"),
    [history],
  );
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (history?.appointments ?? [])
      .filter((a) => a.date >= today && a.status !== "CANCELLED" && a.status !== "COMPLETED")
      .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
  }, [history]);

  if (isLoading || !patient) {
    return <Skeleton className="h-[80vh] w-full" />;
  }

  const archive = () =>
    update(
      { resource: "patients", id: patient.id, values: { status: "ARCHIVED" }, successNotification: false },
      {
        onSuccess: () => {
          toastStore.push({ message: "Пациент перемещён в архив", type: "success" });
          invalidate({ resource: "patients", invalidates: ["detail", "list"] });
        },
      },
    );

  return (
    <div className="flex flex-col gap-5">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => list("patients")} className="text-muted-foreground hover:text-foreground">
          Пациенты
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{patientFullName(patient)}</span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Левая карточка профиля */}
        <aside className="w-full shrink-0 space-y-4 rounded-lg border bg-muted/30 p-5 lg:w-80">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-800">
              {patientInitials(patient)}
            </div>
            <div className="text-center leading-tight">
              <div className="text-lg font-semibold">{patientFullName(patient)}</div>
              <div className="text-[13px] text-muted-foreground">ID #{String(patient.id).slice(0, 8)}</div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-[11px] font-medium text-white">
                {PATIENT_STATUS_LABELS[patient.status]}
              </span>
              {(patient.tags_detail ?? []).map((t) => (
                <span
                  key={t.id}
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ backgroundColor: `${t.color}22`, color: t.color }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-3.5">
            <InfoRow icon={Phone} label="Телефон" value={patient.phone} />
            <InfoRow icon={Mail} label="Email" value={patient.email} />
            <InfoRow icon={Cake} label="Дата рождения" value={patient.birth_date ? `${fmtDate(patient.birth_date)} (${ageFrom(patient.birth_date)})` : "—"} />
            <InfoRow icon={MapPin} label="Адрес" value={patient.address} />
            <InfoRow icon={Instagram} label="Источник" value={patient.source_detail?.title} />
            <InfoRow icon={UserCheck} label="Лечащий врач" value={treatingDoctor} />
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-2">
            <button
              onClick={() => setBookOpen(true)}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <CalendarPlus className="h-4 w-4" /> Записать на приём
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => edit("patients", patient.id)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border bg-card text-sm font-medium hover:bg-accent"
              >
                <Pencil className="h-4 w-4" /> Редактировать
              </button>
              <button
                onClick={archive}
                title="В архив"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card hover:bg-accent"
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Правая часть */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Вкладки */}
          <div className="flex flex-wrap gap-1 rounded-md bg-muted p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Статистика */}
          <div className="flex flex-wrap gap-3">
            <StatCard label="Всего визитов" value={String(patient.visits_count)} icon={Activity} color="#1d4ed8" />
            <StatCard label="Потрачено" value={formatMoneyKopecks(patient.total_revenue_kopecks)} icon={Wallet} color="#16a34a" />
            <StatCard label="Средний чек" value={formatMoneyKopecks(patient.average_check_kopecks)} icon={TrendingUp} color="#a855f7" />
            <StatCard label="Источник" value={patient.source_detail?.title ?? "—"} icon={Instagram} color="#ec4899" />
          </div>

          {historyLoading && <Skeleton className="h-64 w-full" />}

          {!historyLoading && history && tab === "overview" && (
            <div className="flex flex-col gap-4 xl:flex-row">
              {/* Лента активности */}
              <div className="rounded-lg border bg-muted/30 p-[18px] xl:w-[380px] xl:shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold">Лента активности</h3>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 space-y-0">
                  {feed.length === 0 && <Empty />}
                  {feed.slice(0, 12).map((it, i) => (
                    <div key={it.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${it.color}1a` }}>
                          <it.icon className="h-3.5 w-3.5" style={{ color: it.color }} />
                        </span>
                        {i < Math.min(feed.length, 12) - 1 && <span className="w-0.5 flex-1 bg-border" />}
                      </div>
                      <div className="min-w-0 flex-1 pb-4">
                        <div className="text-[13px] font-semibold">{it.title}</div>
                        <div className="truncate text-xs text-muted-foreground">{it.sub}</div>
                        <div className="text-[11px] text-muted-foreground">{it.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Правая колонка: приёмы + комментарии */}
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="rounded-lg border bg-muted/30 p-[18px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold">Предстоящие приёмы</h3>
                  </div>
                  <div className="mt-3 space-y-3">
                    {upcoming.length === 0 && <Empty />}
                    {upcoming.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="flex w-14 shrink-0 flex-col items-center rounded-md bg-blue-600/10 py-2">
                          <span className="text-[13px] font-bold text-blue-700">{a.date.slice(8, 10)}.{a.date.slice(5, 7)}</span>
                          <span className="text-[11px] font-medium text-blue-700">{a.start_time?.slice(0, 5)}</span>
                        </div>
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="truncate text-[13px] font-semibold">{a.doctor_name ?? "—"}</div>
                          <div className="truncate text-xs text-muted-foreground">{a.service_title ?? "Приём"}</div>
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-600/10 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          {APPOINTMENT_STATUS_LABELS[a.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-[18px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold">Комментарии и рекомендации врача</h3>
                    <button
                      onClick={() => setNoteOpen(true)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" /> Добавить
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {noteEvents.length === 0 && patient.notes && (
                      <div className="rounded-lg bg-secondary p-3.5">
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{patient.notes}</p>
                      </div>
                    )}
                    {noteEvents.length === 0 && !patient.notes && <Empty />}
                    {noteEvents.map((e) => (
                      <div key={e.id} className="rounded-lg bg-secondary p-3.5">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                            <UserCheck className="h-3.5 w-3.5 text-primary" />
                            {(e.payload?.author as string) ?? "Врач"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{fmtDate(e.created_at)}</span>
                        </div>
                        <p className="text-[13px] leading-relaxed">{(e.payload?.note as string) ?? ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!historyLoading && history && tab !== "overview" && (
            <ListTab tab={tab} history={history} />
          )}
        </div>
      </div>

      <AppointmentFormDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        defaultPatient={{ id: String(patient.id), label: patientFullName(patient) }}
      />
      <AddNoteDialog open={noteOpen} onOpenChange={setNoteOpen} patientId={String(patient.id)} onSaved={() => refetch()} />
    </div>
  );
}

function Empty() {
  return <p className="py-6 text-center text-sm text-muted-foreground/70">Нет данных</p>;
}

function ListTab({ tab, history }: { tab: TabKey; history: PatientHistory }) {
  const rows: { key: string; icon: FeedItem["icon"]; color: string; title: string; sub: string; date: string }[] = [];
  if (tab === "visits") {
    history.appointments.forEach((a) =>
      rows.push({
        key: a.id, icon: CalendarCheck, color: "#1d4ed8",
        title: a.service_title ?? "Приём",
        sub: [a.doctor_name, a.cabinet ? `каб. ${a.cabinet}` : "", APPOINTMENT_STATUS_LABELS[a.status]].filter(Boolean).join(" · "),
        date: fmtDateTime(`${a.date}T${a.start_time}`),
      }),
    );
  } else if (tab === "calls") {
    history.calls.forEach((c) =>
      rows.push({
        key: c.id, icon: c.direction === "IN" ? PhoneIncoming : PhoneOutgoing, color: "#a855f7",
        title: c.direction === "IN" ? "Входящий звонок" : "Исходящий звонок",
        sub: c.transcript || `Длительность ${Math.floor(c.duration_sec / 60)} мин · ${c.result}`,
        date: fmtDateTime(c.started_at),
      }),
    );
  } else if (tab === "messages") {
    history.messages.forEach((m) =>
      rows.push({
        key: m.id, icon: MessageSquare, color: "#7c3aed",
        title: `${m.channel ?? "Сообщение"}${m.subject ? ` · ${m.subject}` : ""}`,
        sub: m.body || "—", date: fmtDateTime(m.sent_at ?? m.created_at),
      }),
    );
  } else if (tab === "leads") {
    history.leads.forEach((l) =>
      rows.push({
        key: l.id, icon: UserPlus, color: "#ea580c",
        title: `Заявка · ${LEAD_CHANNEL_LABELS[l.channel as LeadChannel] ?? l.channel}`, sub: `${LEAD_STATUS_LABELS[l.status as LeadStatus] ?? l.status} · ${formatMoneyKopecks(l.estimated_value_kopecks)}`,
        date: fmtDateTime(l.created_at),
      }),
    );
  } else if (tab === "notes") {
    history.timeline.filter((e) => e.type === "NOTE").forEach((e) =>
      rows.push({
        key: `n${e.id}`, icon: FileText, color: "#16a34a",
        title: (e.payload?.author as string) ?? "Комментарий врача",
        sub: (e.payload?.note as string) ?? "", date: fmtDateTime(e.created_at),
      }),
    );
  }

  if (tab === "files") {
    return (
      <div className="rounded-lg border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
        Файлы пациента появятся здесь
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-[18px]">
      <div className="space-y-2">
        {rows.length === 0 && <Empty />}
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${r.color}1a` }}>
              <r.icon className="h-4 w-4" style={{ color: r.color }} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium">{r.title}</div>
              <div className="truncate text-xs text-muted-foreground">{r.sub}</div>
            </div>
            <div className="shrink-0 text-xs text-muted-foreground">{r.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
