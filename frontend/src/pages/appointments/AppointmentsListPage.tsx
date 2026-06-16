import { useMemo, useState } from "react";
import { useList, useUpdate, useInvalidate } from "@refinedev/core";
import type { CrudFilter } from "@refinedev/core";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarCheck,
  Plus,
  MoreVertical,
  Pencil,
  Ban,
  CheckCircle2,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DateRangePicker,
  type DateRangeValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toastStore,
} from "@/shared/ui";
import {
  type Appointment,
  type AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_VARIANTS,
} from "@/entities/appointment";
import { DEFAULT_PAGE_SIZE } from "@/shared/config";
import { formatDate } from "@/shared/lib/utils";
import { AppointmentFormDialog } from "./AppointmentFormDialog";

const ALL = "__all__";

export function AppointmentsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>();
  const [page, setPage] = useState(1);

  const resetPage = () => setPage(1);

  const invalidate = useInvalidate();
  const { mutate: update } = useUpdate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (a: Appointment) => { setEditing(a); setDialogOpen(true); };

  const changeStatus = (a: Appointment, status: Appointment["status"], reason?: string) => {
    update(
      {
        resource: "appointments",
        id: a.id,
        values: {
          status,
          ...(status === "CANCELLED"
            ? { cancel_reason: reason ?? "", cancelled_at: new Date().toISOString() }
            : {}),
        },
        successNotification: false,
      },
      {
        onSuccess: () => {
          toastStore.push({ message: "Статус записи обновлён", type: "success" });
          invalidate({ resource: "appointments", invalidates: ["list"] });
        },
        onError: () => toastStore.push({ message: "Не удалось обновить статус", type: "error" }),
      },
    );
  };

  const filters = useMemo<CrudFilter[]>(() => {
    const f: CrudFilter[] = [];
    if (search) f.push({ field: "search", operator: "contains", value: search });
    if (statusFilter !== ALL) f.push({ field: "status", operator: "eq", value: statusFilter });
    if (dateRange?.from) f.push({ field: "date_after", operator: "eq", value: dateRange.from });
    if (dateRange?.to) f.push({ field: "date_before", operator: "eq", value: dateRange.to });
    return f;
  }, [search, statusFilter, dateRange]);

  const { data, isLoading } = useList<Appointment>({
    resource: "appointments",
    pagination: { current: page, pageSize: DEFAULT_PAGE_SIZE },
    sorters: [{ field: "date", order: "desc" }],
    filters,
  });

  const items: Appointment[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));
  const shownFrom = total === 0 ? 0 : (page - 1) * DEFAULT_PAGE_SIZE + 1;
  const shownTo = Math.min(page * DEFAULT_PAGE_SIZE, total);

  const hasActiveFilters = statusFilter !== ALL || !!dateRange || !!search;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter(ALL);
    setDateRange(undefined);
    resetPage();
  };

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Записи на приём</h1>
            <Badge variant="secondary" className="rounded-full">
              {total.toLocaleString("ru-RU")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Все записи пациентов к врачам
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Новая запись
        </Button>
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
            placeholder="Поиск по пациенту, врачу, кабинету..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            resetPage();
          }}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все статусы</SelectItem>
            {(Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {APPOINTMENT_STATUS_LABELS[s]}
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
          placeholder="Период приёма"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4" />
            Сбросить
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Пациент</TableHead>
                <TableHead>Врач</TableHead>
                <TableHead>Услуга</TableHead>
                <TableHead>Кабинет</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                    <CalendarCheck className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    Записи не найдены
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{formatDate(a.date)}</TableCell>
                    <TableCell>
                      {a.start_time?.slice(0, 5)}–{a.end_time?.slice(0, 5)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {a.patient_name ?? a.patient}
                    </TableCell>
                    <TableCell>{a.doctor_name ?? a.doctor}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.service_title ?? "—"}
                    </TableCell>
                    <TableCell>{a.cabinet || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={APPOINTMENT_STATUS_VARIANTS[a.status]}>
                        {APPOINTMENT_STATUS_LABELS[a.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(a)}>
                            <Pencil className="h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          {a.status !== "CONFIRMED" && a.status !== "CANCELLED" && (
                            <DropdownMenuItem onClick={() => changeStatus(a, "CONFIRMED")}>
                              <CheckCircle2 className="h-4 w-4" />
                              Подтвердить
                            </DropdownMenuItem>
                          )}
                          {a.status !== "COMPLETED" && a.status !== "CANCELLED" && (
                            <DropdownMenuItem onClick={() => changeStatus(a, "COMPLETED")}>
                              <CheckCircle2 className="h-4 w-4" />
                              Завершить
                            </DropdownMenuItem>
                          )}
                          {a.status !== "CANCELLED" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => changeStatus(a, "CANCELLED")}
                              >
                                <Ban className="h-4 w-4" />
                                Отменить
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Пагинация */}
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
              <span className="px-2 text-muted-foreground">
                {page} / {pageCount}
              </span>
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
        </CardContent>
      </Card>

      <AppointmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editing}
      />
    </div>
  );
}
