import { useMemo, useState } from "react";
import { useList, useDelete, useNavigation } from "@refinedev/core";
import type { CrudSort, CrudFilter } from "@refinedev/core";
import {
  Plus,
  Search,
  Upload,
  Download,
  ChevronDown,
  Calendar,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
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
  Skeleton,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import {
  type Patient,
  PATIENT_STATUS_LABELS,
  PATIENT_STATUS_VARIANTS,
  patientFullName,
  patientInitials,
} from "@/entities/patient";
import { DEFAULT_PAGE_SIZE } from "@/shared/config";
import { formatDate } from "@/shared/lib/utils";

type TabKey = "all" | "ACTIVE" | "ARCHIVED" | "NEW";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "ACTIVE", label: "Активные" },
  { key: "ARCHIVED", label: "Архив" },
  { key: "NEW", label: "Новые" },
];

const FILTER_PLACEHOLDERS = [
  { label: "Источник", width: "w-[140px]" },
  { label: "Статус", width: "w-[120px]" },
  { label: "Теги", width: "w-[120px]" },
  { label: "Врач", width: "w-[160px]" },
];

/** Числа страниц с «…» для компактной пагинации. */
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

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [sorter] = useState<CrudSort>({ field: "last_name", order: "asc" });

  const filters = useMemo<CrudFilter[]>(() => {
    const f: CrudFilter[] = [];
    if (search) f.push({ field: "search", operator: "contains", value: search });
    if (tab !== "all") f.push({ field: "status", operator: "eq", value: tab });
    return f;
  }, [search, tab]);

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

  const setTabAndReset = (key: TabKey) => {
    setTab(key);
    setPage(1);
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Импорт
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4" />
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
            onClick={() => setTabAndReset(t.key)}
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
        <div className="flex h-9 w-[280px] items-center gap-2 rounded-md border bg-muted/50 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Поиск по ФИО, телефону, email..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {FILTER_PLACEHOLDERS.map((f) => (
          <button
            key={f.label}
            disabled
            className={cn(
              "flex h-9 items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 text-sm text-foreground/80",
              f.width,
            )}
          >
            {f.label}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
        <button
          disabled
          className="flex h-9 w-[180px] items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground"
        >
          <Calendar className="h-4 w-4" />
          01.06 — 15.06.2026
        </button>
        <Button variant="outline" size="icon" className="h-9 w-9" disabled>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Таблица */}
      <div className="overflow-hidden rounded-lg border bg-card">
        {/* Шапка */}
        <div className="flex h-11 items-center gap-3 border-b bg-muted/40 px-4 text-xs font-semibold text-muted-foreground">
          <div className="w-[220px]">ФИО</div>
          <div className="w-[140px]">Телефон</div>
          <div className="hidden w-[180px] lg:block">Email</div>
          <div className="hidden w-[110px] xl:block">Дата рождения</div>
          <div className="hidden w-[120px] md:block">Последний визит</div>
          <div className="hidden w-[120px] xl:block">Источник</div>
          <div className="w-[100px]">Статус</div>
          <div className="hidden flex-1 lg:block">Теги</div>
          <div className="w-10" />
        </div>

        {/* Тело */}
        {isLoading &&
          Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b px-4 py-3.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 flex-1" />
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
              className="flex items-center gap-3 border-b px-4 py-2.5 text-sm last:border-b-0 hover:bg-muted/40"
            >
              {/* ФИО */}
              <div className="flex w-[220px] items-center gap-2.5">
                <Avatar initials={patientInitials(p)} size={32} />
                <div className="min-w-0 leading-tight">
                  <div className="truncate font-medium">{patientFullName(p)}</div>
                  <div className="text-xs text-muted-foreground">
                    ID #{String(p.id).slice(0, 6)}
                  </div>
                </div>
              </div>
              <div className="w-[140px]">{p.phone}</div>
              <div className="hidden w-[180px] truncate text-muted-foreground lg:block">
                {p.email || "—"}
              </div>
              <div className="hidden w-[110px] xl:block">{formatDate(p.birth_date)}</div>
              <div className="hidden w-[120px] md:block">
                {formatDate(p.last_visit_date)}
              </div>
              <div className="hidden w-[120px] truncate text-muted-foreground xl:block">
                {p.source_detail?.title ?? "—"}
              </div>
              <div className="w-[100px]">
                <Badge variant={PATIENT_STATUS_VARIANTS[p.status]}>
                  {PATIENT_STATUS_LABELS[p.status]}
                </Badge>
              </div>
              <div className="hidden flex-1 items-center gap-1 lg:flex">
                {(p.tags_detail ?? []).slice(0, 2).map((t) => (
                  <Badge key={t.id} variant="secondary" className="font-normal">
                    {t.label}
                  </Badge>
                ))}
                {(p.tags_detail?.length ?? 0) > 2 && (
                  <Badge variant="secondary" className="font-normal">
                    +{(p.tags_detail?.length ?? 0) - 2}
                  </Badge>
                )}
              </div>
              {/* Действия */}
              <div className="w-10 text-right">
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

        {/* Футер */}
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
