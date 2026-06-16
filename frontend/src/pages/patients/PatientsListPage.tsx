import { useMemo, useRef, useState } from "react";
import { useList, useDelete, useNavigation, useInvalidate } from "@refinedev/core";
import type { CrudSort, CrudFilter } from "@refinedev/core";
import {
  Plus,
  Search,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DateRangePicker,
  type DateRangeValue,
  Skeleton,
  toastStore,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import {
  type Patient,
  PATIENT_STATUS_LABELS,
  PATIENT_STATUS_VARIANTS,
  type PatientStatus,
  patientFullName,
  patientInitials,
} from "@/entities/patient";
import { DEFAULT_PAGE_SIZE } from "@/shared/config";
import { formatDate } from "@/shared/lib/utils";
import { http } from "@/shared/api/http";
import { usePatientSources, usePatientTags } from "./usePatientMeta";

type TabKey = "all" | "ACTIVE" | "ARCHIVED" | "NEW";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "ACTIVE", label: "Активные" },
  { key: "ARCHIVED", label: "Архив" },
  { key: "NEW", label: "Новые" },
];

const ALL = "__all__";

// Единый grid-шаблон для шапки и строк таблицы — гарантирует выравнивание колонок.
const ROW_GRID =
  "grid grid-cols-[minmax(180px,1.6fr)_130px_minmax(140px,1.3fr)_110px_120px_minmax(110px,1fr)_104px_minmax(120px,1.2fr)_40px] items-center gap-2 px-4";

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function PatientsListPage() {
  const { show, create, edit } = useNavigation();
  const { mutate: remove } = useDelete();
  const sources = usePatientSources();
  const tags = usePatientTags();

  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("search") ?? "";
  });
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [sourceCode, setSourceCode] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [tagFilter, setTagFilter] = useState<string>(ALL);
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>();
  const [sorter] = useState<CrudSort>({ field: "last_name", order: "asc" });

  const resetPage = () => setPage(1);

  const invalidate = useInvalidate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Параметры запроса из активных фильтров — чтобы экспорт совпадал с таблицей.
  const queryParams = useMemo<Record<string, string>>(() => {
    const p: Record<string, string> = {};
    if (search) p.search = search;
    const effectiveStatus = tab !== "all" ? tab : statusFilter !== ALL ? statusFilter : null;
    if (effectiveStatus) p.status = effectiveStatus;
    if (sourceCode !== ALL) p.source_code = sourceCode;
    if (tagFilter !== ALL) p.tag = tagFilter;
    if (dateRange?.from) p.last_visit_after = dateRange.from;
    if (dateRange?.to) p.last_visit_before = dateRange.to;
    return p;
  }, [search, tab, statusFilter, sourceCode, tagFilter, dateRange]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await http.get("/patients/export/", {
        params: queryParams,
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `patients-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toastStore.push({ message: "Экспорт готов", description: "Файл CSV скачан.", type: "success" });
    } catch {
      toastStore.push({ message: "Не удалось выполнить экспорт", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await http.post<{ created: number; skipped: number; errors: string[] }>(
        "/patients/import/",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toastStore.push({
        message: `Импорт завершён: добавлено ${data.created}`,
        description: data.skipped
          ? `Пропущено ${data.skipped} (дубликаты или ошибки).`
          : "Все записи добавлены.",
        type: "success",
      });
      invalidate({ resource: "patients", invalidates: ["list"] });
    } catch {
      toastStore.push({
        message: "Не удалось импортировать файл",
        description: "Проверьте, что это CSV с колонками last_name, first_name, phone.",
        type: "error",
      });
    } finally {
      setImporting(false);
    }
  };

  const filters = useMemo<CrudFilter[]>(() => {
    const f: CrudFilter[] = [];
    if (search) f.push({ field: "search", operator: "contains", value: search });
    // Вкладка имеет приоритет над отдельным фильтром статуса.
    const effectiveStatus = tab !== "all" ? tab : statusFilter !== ALL ? statusFilter : null;
    if (effectiveStatus) f.push({ field: "status", operator: "eq", value: effectiveStatus });
    if (sourceCode !== ALL) f.push({ field: "source_code", operator: "eq", value: sourceCode });
    if (tagFilter !== ALL) f.push({ field: "tag", operator: "eq", value: tagFilter });
    if (dateRange?.from) f.push({ field: "last_visit_after", operator: "eq", value: dateRange.from });
    if (dateRange?.to) f.push({ field: "last_visit_before", operator: "eq", value: dateRange.to });
    return f;
  }, [search, tab, statusFilter, sourceCode, tagFilter, dateRange]);

  const { data, isLoading } = useList<Patient>({
    resource: "patients",
    pagination: { current: page, pageSize: DEFAULT_PAGE_SIZE },
    sorters: [sorter],
    filters,
  });

  const patients = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));
  const shownFrom = total === 0 ? 0 : (page - 1) * DEFAULT_PAGE_SIZE + 1;
  const shownTo = Math.min(page * DEFAULT_PAGE_SIZE, total);

  const hasActiveFilters =
    sourceCode !== ALL || statusFilter !== ALL || tagFilter !== ALL || !!dateRange || !!search;

  const resetFilters = () => {
    setSearch("");
    setSourceCode(ALL);
    setStatusFilter(ALL);
    setTagFilter(ALL);
    setDateRange(undefined);
    setTab("all");
    resetPage();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок + действия */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-semibold leading-none tracking-tight">
              Пациенты
            </h1>
            <Badge variant="secondary" className="rounded-full">
              {total.toLocaleString("ru-RU")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Управление базой пациентов клиники
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Импорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting || total === 0}
            onClick={handleExport}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Экспорт
          </Button>
          <Button size="sm" onClick={() => create("patients")}>
            <Plus className="h-4 w-4" />
            Новый пациент
          </Button>
        </div>
      </div>

      {/* Вкладки */}
      <div className="inline-flex h-10 w-fit items-center gap-1 rounded-md bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              resetPage();
            }}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Панель фильтров */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-9 w-[280px] items-center gap-2 rounded-md border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Поиск по ФИО, телефону, email..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Select
          value={sourceCode}
          onValueChange={(v) => {
            setSourceCode(v);
            resetPage();
          }}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Источник" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все источники</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s.id} value={s.code}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setTab("all");
            resetPage();
          }}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все статусы</SelectItem>
            {(Object.keys(PATIENT_STATUS_LABELS) as PatientStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {PATIENT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={tagFilter}
          onValueChange={(v) => {
            setTagFilter(v);
            resetPage();
          }}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Теги" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все теги</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t.id} value={t.label}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
          className="h-9 w-[210px]"
          value={dateRange}
          onChange={(v) => {
            setDateRange(v);
            resetPage();
          }}
          placeholder="Период визита"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4" />
            Сбросить
          </Button>
        )}
      </div>

      {/* Таблица */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          {/* Шапка таблицы (та же grid-сетка, что и строки — колонки всегда выровнены) */}
          <div className={cn(ROW_GRID, "h-11 border-b bg-muted/40 text-xs font-semibold text-muted-foreground")}>
            <div>ФИО</div>
            <div>Телефон</div>
            <div>Email</div>
            <div>Дата рождения</div>
            <div>Последний визит</div>
            <div>Источник</div>
            <div>Статус</div>
            <div>Теги</div>
            <div />
          </div>

          {isLoading &&
            Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
              <div key={i} className={cn(ROW_GRID, "h-14 border-b")}>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <div />
              </div>
            ))}

          {!isLoading && patients.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Пациенты не найдены
            </div>
          )}

          {!isLoading &&
            patients.map((p) => (
              <div
                key={p.id}
                className={cn(ROW_GRID, "h-14 border-b text-sm last:border-b-0 hover:bg-muted/40")}
              >
                {/* ФИО */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar initials={patientInitials(p)} size={32} />
                  <div className="min-w-0 leading-tight">
                    <div className="truncate font-medium">{patientFullName(p)}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      ID #{String(p.id).slice(0, 6)}
                    </div>
                  </div>
                </div>
                <div className="truncate">{p.phone}</div>
                <div className="truncate text-muted-foreground">{p.email || "—"}</div>
                <div className="truncate">{formatDate(p.birth_date)}</div>
                <div className="truncate">{formatDate(p.last_visit_date)}</div>
                <div className="truncate text-muted-foreground">
                  {p.source_detail?.title ?? "—"}
                </div>
                <div className="min-w-0">
                  <Badge variant={PATIENT_STATUS_VARIANTS[p.status]}>
                    {PATIENT_STATUS_LABELS[p.status]}
                  </Badge>
                </div>
                <div
                  className="flex min-w-0 items-center gap-1"
                  title={(p.tags_detail ?? []).map((t) => t.label).join(", ")}
                >
                  {(p.tags_detail ?? []).slice(0, 1).map((t) => (
                    <Badge
                      key={t.id}
                      variant="secondary"
                      className="max-w-full shrink truncate whitespace-nowrap font-normal"
                    >
                      {t.label}
                    </Badge>
                  ))}
                  {(p.tags_detail?.length ?? 0) > 1 && (
                    <Badge variant="secondary" className="shrink-0 font-normal">
                      +{(p.tags_detail?.length ?? 0) - 1}
                    </Badge>
                  )}
                  {(p.tags_detail?.length ?? 0) === 0 && (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                {/* Действия */}
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => show("patients", p.id)}>
                        <Eye className="h-4 w-4" />
                        Просмотр
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => edit("patients", p.id)}>
                        <Pencil className="h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => remove({ resource: "patients", id: p.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Показано {shownFrom}–{shownTo} из {total.toLocaleString("ru-RU")}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>
            {pageRange(page, pageCount).map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="px-2 text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "outline" : "ghost"}
                  size="icon"
                  className={cn("h-9 w-9", p === page && "border-input")}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Вперёд
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
