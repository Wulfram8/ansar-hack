import { useEffect, useMemo, useState } from "react";
import { useList, useUpdate } from "@refinedev/core";
import type { CrudFilter } from "@refinedev/core";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  Globe,
  Phone,
  MessageCircle,
  Send,
  Mail,
  Instagram,
  Circle,
  Flame,
  Clock3,
  MessageSquare,
  Plus,
  Filter,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DateRangePicker,
  type DateRangeValue,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import {
  type Lead,
  type LeadChannel,
  type LeadStatus,
  LEAD_PIPELINE,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_DOT,
  LEAD_CHANNEL_LABELS,
} from "@/entities/lead";
import { formatMoneyKopecks, formatTimeAgo } from "@/shared/lib/utils";
import { useLeadSources, useAdmins } from "./useLeadMeta";
import { LeadFormDialog } from "./LeadFormDialog";

const ALL = "__all__";

const CHANNEL_ICONS: Record<LeadChannel, LucideIcon> = {
  SITE: Globe,
  CALL: Phone,
  WHATSAPP: MessageCircle,
  TELEGRAM: Send,
  EMAIL: Mail,
  INSTAGRAM: Instagram,
  OTHER: Circle,
};

function LeadCardBody({ lead }: { lead: Lead }) {
  const ChannelIcon = CHANNEL_ICONS[lead.channel] ?? Circle;
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
            <ChannelIcon className="h-3 w-3 text-muted-foreground" />
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {LEAD_CHANNEL_LABELS[lead.channel]}
          </span>
        </div>
        {lead.hot && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
            <Flame className="h-2.5 w-2.5" />
            Горячий
          </span>
        )}
      </div>

      <div className="mt-2.5 space-y-0.5">
        <div className="truncate text-[13px] font-semibold">
          {lead.first_name} {lead.last_name}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {lead.service_interest_title ?? "—"}
        </div>
      </div>

      <div className="mt-2 text-[13px] font-semibold">
        {formatMoneyKopecks(lead.estimated_value_kopecks)}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock3 className="h-3 w-3" />
          {formatTimeAgo(lead.created_at)}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <MessageSquare className="h-3.5 w-3.5" />
          {lead.assigned_admin_initials && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
              {lead.assigned_admin_initials}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

function DraggableCard({ lead, onOpen }: { lead: Lead; onOpen: (l: Lead) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { status: lead.status },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(lead)}
      className={cn(
        "touch-none rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging ? "cursor-grabbing opacity-40" : "cursor-grab",
      )}
    >
      <LeadCardBody lead={lead} />
    </div>
  );
}

function Column({
  stage,
  leads,
  isLoading,
  isOver,
  onAdd,
  onOpen,
}: {
  stage: LeadStatus;
  leads: Lead[];
  isLoading: boolean;
  isOver: boolean;
  onAdd: (stage: LeadStatus) => void;
  onOpen: (l: Lead) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 flex-col rounded-lg bg-muted transition-colors",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: LEAD_STATUS_DOT[stage] }}
          />
          <span className="text-[13px] font-semibold">{LEAD_STATUS_LABELS[stage]}</span>
          <span className="rounded-full border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {leads.length}
          </span>
        </div>
        <button
          onClick={() => onAdd(stage)}
          title="Добавить лид в эту стадию"
          className="text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 pt-1">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        {!isLoading && leads.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground/70">Нет лидов</p>
        )}
        {!isLoading && leads.map((lead) => <DraggableCard key={lead.id} lead={lead} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

export function LeadsPage() {
  const sources = useLeadSources();
  const admins = useAdmins();
  const { mutate: updateLead } = useUpdate();

  // Фильтры.
  const [sourceCode, setSourceCode] = useState(ALL);
  const [channel, setChannel] = useState(ALL);
  const [adminId, setAdminId] = useState(ALL);
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>();
  const [hotOnly, setHotOnly] = useState(false);

  // Состояние модального окна создания/редактирования лида.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [createStage, setCreateStage] = useState<LeadStatus | undefined>();

  const openCreate = (stage?: LeadStatus) => {
    setEditingLead(null);
    setCreateStage(stage);
    setDialogOpen(true);
  };
  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setCreateStage(undefined);
    setDialogOpen(true);
  };

  const filters = useMemo<CrudFilter[]>(() => {
    const f: CrudFilter[] = [];
    if (sourceCode !== ALL) f.push({ field: "source_code", operator: "eq", value: sourceCode });
    if (channel !== ALL) f.push({ field: "channel", operator: "eq", value: channel });
    if (adminId !== ALL) f.push({ field: "assigned_admin", operator: "eq", value: adminId });
    if (dateRange?.from) f.push({ field: "created_after", operator: "eq", value: dateRange.from });
    if (dateRange?.to) f.push({ field: "created_before", operator: "eq", value: dateRange.to });
    return f;
  }, [sourceCode, channel, adminId, dateRange]);

  const { data, isLoading } = useList<Lead>({
    resource: "leads",
    pagination: { mode: "off" },
    filters,
  });

  // Локальная копия для оптимистичного перетаскивания.
  const [board, setBoard] = useState<Lead[]>([]);
  useEffect(() => {
    setBoard(data?.data ?? []);
  }, [data?.data]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStatus | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeLead = board.find((l) => l.id === activeId) ?? null;
  const total = board.length;

  const adminLabel = (a: { first_name?: string; last_name?: string; username: string }) =>
    [a.last_name, a.first_name].filter(Boolean).join(" ") || a.username;

  const hasActiveFilters =
    sourceCode !== ALL || channel !== ALL || adminId !== ALL || !!dateRange || hotOnly;

  const resetFilters = () => {
    setSourceCode(ALL);
    setChannel(ALL);
    setAdminId(ALL);
    setDateRange(undefined);
    setHotOnly(false);
  };

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: { over: { id: string | number } | null }) {
    setOverStage(e.over ? (String(e.over.id) as LeadStatus) : null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    setOverStage(null);
    const leadId = String(e.active.id);
    const target = e.over ? (String(e.over.id) as LeadStatus) : null;
    if (!target) return;
    const lead = board.find((l) => l.id === leadId);
    if (!lead || lead.status === target) return;

    // Оптимистично перемещаем карточку.
    setBoard((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: target } : l)),
    );
    updateLead(
      {
        resource: "leads",
        id: leadId,
        values: { status: target },
        mutationMode: "optimistic",
        successNotification: false,
      },
      {
        onError: () => {
          // Откат при ошибке.
          setBoard((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l)),
          );
        },
      },
    );
  }

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Заголовок + действия */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Лиды</h1>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {total}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Управляйте заявками и продвижением сделок по воронке
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreate()}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Новый лид
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={sourceCode} onValueChange={setSourceCode}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <Filter className="h-3 w-3 text-muted-foreground" />
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

        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="h-8 w-[150px] text-xs">
            <SelectValue placeholder="Канал" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все каналы</SelectItem>
            {(Object.keys(LEAD_CHANNEL_LABELS) as LeadChannel[]).map((c) => (
              <SelectItem key={c} value={c}>
                {LEAD_CHANNEL_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={adminId} onValueChange={setAdminId}>
          <SelectTrigger className="h-8 w-[190px] text-xs">
            <User className="h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Администратор" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все администраторы</SelectItem>
            {admins.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {adminLabel(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
          className="h-8 w-[200px] text-xs"
          value={dateRange}
          onChange={setDateRange}
          placeholder="Период"
        />

        <button
          onClick={() => setHotOnly((v) => !v)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
            hotOnly
              ? "border-amber-300 bg-amber-100 text-amber-800"
              : "bg-card text-muted-foreground hover:bg-accent",
          )}
        >
          <Flame className="h-3 w-3" />
          Только горячие
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent"
          >
            <X className="h-3 w-3" />
            Сбросить
          </button>
        )}
      </div>

      {/* Канбан-доска */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {LEAD_PIPELINE.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              leads={board.filter(
                (l) => l.status === stage && (!hotOnly || l.hot),
              )}
              isLoading={isLoading}
              isOver={overStage === stage}
              onAdd={openCreate}
              onOpen={openEdit}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="w-[260px] rotate-2 rounded-lg border bg-card p-3 shadow-lg">
              <LeadCardBody lead={activeLead} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <LeadFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={editingLead}
        defaultStatus={createStage}
      />
    </div>
  );
}
