import { useMemo, useState } from "react";
import {
  Plane,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlarmClock,
  BarChart3,
} from "lucide-react";
import {
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { useScheduleBoard } from "./useScheduleBoard";
import { ScheduleFormDialog } from "./ScheduleFormDialog";

type ViewMode = "day" | "week" | "month";

const VIEW_TABS: { key: ViewMode; label: string }[] = [
  { key: "day", label: "День" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
];

const ALL = "__all__";
const LOAD_FILTERS: { key: string; label: string }[] = [
  { key: ALL, label: "Любая загрузка" },
  { key: "high", label: "Перегруженные (≥85%)" },
  { key: "mid", label: "Средняя (60–84%)" },
  { key: "low", label: "Свободные (<60%)" },
];

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function mondayOf(d: Date): Date {
  const x = new Date(d);
  const wd = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - wd);
  x.setHours(0, 0, 0, 0);
  return x;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function SchedulePage() {
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [specialty, setSpecialty] = useState<string>(ALL);
  const [load, setLoad] = useState<string>(ALL);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [timeoffOpen, setTimeoffOpen] = useState(false);

  // Доска всегда грузится по неделе, содержащей cursor.
  const weekStart = useMemo(() => mondayOf(cursor), [cursor]);
  const { data, isLoading, refetch } = useScheduleBoard(iso(weekStart));
  const board = data?.data;

  const monthLabel = useMemo(
    () => `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`,
    [cursor],
  );

  // Список специальностей из загруженных врачей.
  const specialties = useMemo(() => {
    const set = new Set<string>();
    board?.doctors.forEach((d) => d.specialty && set.add(d.specialty));
    return [...set].sort();
  }, [board]);

  // Шаг навигации зависит от режима: день / неделя / месяц.
  const shift = (delta: number) => {
    const d = new Date(cursor);
    if (view === "day") d.setDate(d.getDate() + delta);
    else if (view === "week") d.setDate(d.getDate() + delta * 7);
    else d.setMonth(d.getMonth() + delta);
    setCursor(d);
  };

  const goToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCursor(d);
  };

  // Индексы дней-колонок для текущего режима.
  // День — только выбранный день недели; Неделя/Месяц — все 7 (Месяц = обзор недели месяца).
  const visibleDayIndices = useMemo(() => {
    if (view === "day") {
      const idx = (cursor.getDay() + 6) % 7; // 0=Пн
      return [idx];
    }
    return [0, 1, 2, 3, 4, 5, 6];
  }, [view, cursor]);

  // Фильтрация врачей по специальности и загрузке.
  const visibleDoctors = useMemo(() => {
    let docs = board?.doctors ?? [];
    if (specialty !== ALL) docs = docs.filter((d) => d.specialty === specialty);
    if (load !== ALL) {
      docs = docs.filter((d) => {
        if (load === "high") return d.load_percent >= 85;
        if (load === "mid") return d.load_percent >= 60 && d.load_percent < 85;
        return d.load_percent < 60;
      });
    }
    return docs;
  }, [board, specialty, load]);

  const headerLabel = view === "month"
    ? monthLabel
    : view === "day"
      ? cursor.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
      : monthLabel;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Заголовок */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Расписание врачей</h1>
          <p className="text-sm text-muted-foreground">
            Управление графиками работы и отпусками
            {board ? ` · ${board.week_label}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeoffOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm font-medium hover:bg-accent"
          >
            <Plane className="h-4 w-4" />
            Отпуск
          </button>
          <button
            onClick={() => setShiftOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Новая смена
          </button>
        </div>
      </div>

      {/* Тулбар */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 items-center gap-1 rounded-md bg-secondary p-1">
            {VIEW_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setView(t.key)}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  t.key === view
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => shift(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-md border bg-card hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToday}
              className="h-9 rounded-md border bg-card px-3 text-sm font-medium hover:bg-accent"
            >
              Сегодня
            </button>
            <button
              onClick={() => shift(1)}
              className="flex h-9 w-9 items-center justify-center rounded-md border bg-card hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="ml-1 text-sm font-medium capitalize">{headerLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="h-9 w-[190px] text-sm">
              <SelectValue placeholder="Все специальности" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Все специальности</SelectItem>
              {specialties.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={load} onValueChange={setLoad}>
            <SelectTrigger className="h-9 w-[200px] text-sm">
              <SelectValue placeholder="Любая загрузка" />
            </SelectTrigger>
            <SelectContent>
              {LOAD_FILTERS.map((l) => (
                <SelectItem key={l.key} value={l.key}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gantt */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            {/* Шапка дней */}
            <div className="flex border-b bg-muted/60">
              <div className="w-[260px] shrink-0 border-r px-4 py-3 text-xs font-medium text-muted-foreground">
                Врачи
              </div>
              <div className="flex flex-1">
                {(board?.day_headers
                  ? visibleDayIndices.map((i) => board.day_headers[i])
                  : Array.from({ length: visibleDayIndices.length })
                ).map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center border-r py-2 last:border-r-0",
                      !!(h && (h as { is_today: boolean }).is_today) && "bg-blue-50",
                    )}
                  >
                    {h ? (
                      <>
                        <span
                          className={cn(
                            "text-[11px] font-semibold",
                            (h as { is_today: boolean }).is_today
                              ? "text-blue-800"
                              : "text-muted-foreground",
                          )}
                        >
                          {(h as { weekday: string }).weekday}
                        </span>
                        <span
                          className={cn(
                            "text-[11px]",
                            (h as { is_today: boolean }).is_today
                              ? "text-blue-800"
                              : "text-muted-foreground",
                          )}
                        >
                          {(h as { date_label: string }).date_label}
                        </span>
                      </>
                    ) : (
                      <Skeleton className="h-6 w-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Строки врачей */}
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex h-[72px] items-center border-b">
                  <div className="flex w-[260px] shrink-0 items-center gap-3 border-r px-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                  <Skeleton className="mx-3 h-9 flex-1" />
                </div>
              ))}

            {!isLoading && board && visibleDoctors.length === 0 && (
              <div className="py-16 text-center text-sm text-muted-foreground">
                {board.doctors.length === 0
                  ? "Нет врачей. Запустите seed_schedules."
                  : "Нет врачей под выбранные фильтры."}
              </div>
            )}

            {!isLoading &&
              visibleDoctors.map((doc) => (
                <div key={doc.id} className="flex h-[72px] border-b last:border-b-0">
                  {/* Левая колонка врача */}
                  <div className="flex w-[260px] shrink-0 items-center gap-2.5 border-r px-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                      style={{ backgroundColor: `${doc.color}22`, color: doc.color }}
                    >
                      {doc.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold">{doc.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {doc.specialty}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${doc.load_percent}%`,
                              backgroundColor:
                                doc.load_percent >= 85
                                  ? "#ef4444"
                                  : doc.load_percent >= 60
                                    ? "#f59e0b"
                                    : "#22c55e",
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold">{doc.load_percent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Дни */}
                  <div className="flex flex-1">
                    {visibleDayIndices.map((di) => {
                      const day = doc.days[di];
                      if (!day) return <div key={di} className="flex-1 border-r last:border-r-0" />;
                      return (
                        <div
                          key={di}
                          className={cn(
                            "relative flex-1 border-r last:border-r-0",
                            day.is_off && "bg-muted/40",
                          )}
                        >
                          {day.is_off ? (
                            <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                              {day.off_label}
                            </div>
                          ) : (
                            day.blocks.map((b, bi) => (
                              <div
                                key={bi}
                                title={`${b.start}–${b.end} · ${b.patient ?? ""} · ${b.service ?? ""}`}
                                className="absolute top-1/2 h-9 -translate-y-1/2 overflow-hidden rounded-[3px] border-l-2 px-1 py-0.5"
                                style={{
                                  left: `${b.left_pct}%`,
                                  width: `${b.width_pct}%`,
                                  backgroundColor: `${doc.color}22`,
                                  borderColor: doc.color,
                                }}
                              >
                                <div
                                  className="truncate text-[9px] font-semibold leading-tight"
                                  style={{ color: doc.color }}
                                >
                                  {b.start}
                                </div>
                                <div className="truncate text-[9px] leading-tight text-foreground/70">
                                  {b.patient ?? ""}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Сводки */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Свободные окна */}
        <div className="rounded-lg border bg-card p-[18px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Свободные окна</div>
              <div className="text-xs text-muted-foreground">На этой неделе</div>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100">
              <AlarmClock className="h-4 w-4 text-emerald-600" />
            </span>
          </div>
          <div className="mt-3 text-[28px] font-bold leading-none">
            {board?.free_slots_total ?? "—"}
          </div>
          {board && (
            <div className="mt-1 text-xs text-emerald-600">
              +{board.free_slots_delta} к прошлой неделе
            </div>
          )}
          <div className="mt-3 space-y-1.5">
            {board?.free_slots_by_day.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-semibold">{d.count} окон</span>
              </div>
            ))}
          </div>
        </div>

        {/* Загрузка по врачам */}
        <div className="rounded-lg border bg-card p-[18px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Загрузка по врачам</div>
              <div className="text-xs text-muted-foreground">
                Средняя: {board ? `${board.load_avg}%` : "—"}
              </div>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
              <BarChart3 className="h-4 w-4 text-blue-700" />
            </span>
          </div>
          <div className="mt-4 flex h-[110px] items-end gap-2.5">
            {board?.load_bars.map((b) => (
              <div key={b.initials} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-semibold">{b.percent}%</span>
                <div
                  className="w-full rounded-t-[3px]"
                  style={{ height: `${b.percent * 0.9}px`, backgroundColor: b.color }}
                />
                <span className="text-[10px] text-muted-foreground">{b.initials}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Отпуска / выходные */}
        <div className="rounded-lg border bg-card p-[18px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Отпуска / выходные</div>
              <div className="text-xs text-muted-foreground">Ближайшие 30 дней</div>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100">
              <Plane className="h-4 w-4 text-amber-600" />
            </span>
          </div>
          <div className="mt-3 space-y-2.5">
            {board?.time_off.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground/70">
                Нет запланированных отсутствий
              </p>
            )}
            {board?.time_off.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{t.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{t.detail}</div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: `${t.color}22`, color: t.color }}
                >
                  {t.kind}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScheduleFormDialog open={shiftOpen} onOpenChange={setShiftOpen} mode="shift" onSaved={() => refetch()} />
      <ScheduleFormDialog open={timeoffOpen} onOpenChange={setTimeoffOpen} mode="timeoff" onSaved={() => refetch()} />
    </div>
  );
}
