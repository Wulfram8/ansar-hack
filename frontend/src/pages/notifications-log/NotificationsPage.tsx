import { useState } from "react";
import { useList, useUpdate, useDelete, useInvalidate } from "@refinedev/core";
import { Plus, Pencil, Trash2, Ban, RefreshCw } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  toastStore,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { formatDateTime } from "@/shared/lib/utils";
import { http } from "@/shared/api/http";
import {
  type AutomationRule,
  type ScheduledNotification,
  TRIGGER_KIND_LABELS,
  SCHEDULED_STATUS_LABELS,
  type ScheduledStatus,
} from "@/entities/notification";
import { RuleFormDialog } from "./RuleFormDialog";

type TabKey = "scheduled" | "rules";

const STATUS_VARIANT: Record<ScheduledStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  SENT: "success",
  FAILED: "destructive",
  CANCELLED: "secondary",
};

export function NotificationsPage() {
  const [tab, setTab] = useState<TabKey>("scheduled");
  const invalidate = useInvalidate();
  const { mutate: update } = useUpdate();
  const { mutate: removeRule } = useDelete();

  const { data: scheduledData, isLoading: scheduledLoading } = useList<ScheduledNotification>({
    resource: "notifications/scheduled",
    pagination: { mode: "off" },
  });
  const { data: rulesData, isLoading: rulesLoading } = useList<AutomationRule>({
    resource: "notifications/rules",
    pagination: { mode: "off" },
  });

  const scheduled = scheduledData?.data ?? [];
  const rules = rulesData?.data ?? [];

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const refreshScheduled = () => invalidate({ resource: "notifications/scheduled", invalidates: ["list"] });
  const refreshRules = () => invalidate({ resource: "notifications/rules", invalidates: ["list"] });

  const scheduledAction = async (id: string, kind: "cancel" | "retry") => {
    try {
      await http.post(`/notifications/scheduled/${id}/${kind}/`);
      toastStore.push({ message: kind === "cancel" ? "Уведомление отменено" : "Уведомление перезапланировано", type: "success" });
      refreshScheduled();
    } catch {
      toastStore.push({ message: "Действие не выполнено", type: "error" });
    }
  };

  const toggleRule = (rule: AutomationRule) =>
    update(
      { resource: "notifications/rules", id: rule.id, values: { is_active: !rule.is_active }, successNotification: false },
      {
        onSuccess: () => { toastStore.push({ message: "Правило обновлено", type: "success" }); refreshRules(); },
        onError: () => toastStore.push({ message: "Не удалось обновить", type: "error" }),
      },
    );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Уведомления</h1>
          <p className="text-sm text-muted-foreground">Запланированные рассылки и правила автоматизации</p>
        </div>
        {tab === "rules" && (
          <Button size="sm" onClick={() => { setEditingRule(null); setRuleDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> Новое правило
          </Button>
        )}
      </div>

      <div className="inline-flex gap-1 rounded-md bg-muted p-1">
        {[
          { key: "scheduled" as const, label: `Запланированные (${scheduled.length})` },
          { key: "rules" as const, label: `Правила (${rules.length})` },
        ].map((t) => (
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

      {tab === "scheduled" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Очередь уведомлений</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Когда</TableHead>
                  <TableHead>Пациент</TableHead>
                  <TableHead>Шаблон</TableHead>
                  <TableHead>Канал</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Ошибка</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledLoading && (
                  <TableRow><TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                )}
                {!scheduledLoading && scheduled.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      Нет запланированных уведомлений
                    </TableCell>
                  </TableRow>
                )}
                {!scheduledLoading && scheduled.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{formatDateTime(n.send_at)}</TableCell>
                    <TableCell className="font-medium">{n.patient_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{n.template_title ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{n.channel_code ?? "—"}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[n.status]}>{SCHEDULED_STATUS_LABELS[n.status]}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{n.last_error || "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {(n.status === "PENDING" || n.status === "FAILED") && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Отменить" onClick={() => scheduledAction(n.id, "cancel")}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        {(n.status === "FAILED" || n.status === "CANCELLED") && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Перезапланировать" onClick={() => scheduledAction(n.id, "retry")}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "rules" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Правила автоматизации</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Шаблон</TableHead>
                  <TableHead>Триггер</TableHead>
                  <TableHead>Смещение</TableHead>
                  <TableHead>Активно</TableHead>
                  <TableHead className="w-40" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesLoading && (
                  <TableRow><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                )}
                {!rulesLoading && rules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      Правил пока нет — создайте первое
                    </TableCell>
                  </TableRow>
                )}
                {!rulesLoading && rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.template_title ?? "—"}</TableCell>
                    <TableCell>{TRIGGER_KIND_LABELS[r.trigger_kind]}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.offset_minutes > 0 ? `+${r.offset_minutes}` : r.offset_minutes} мин
                    </TableCell>
                    <TableCell><Badge variant={r.is_active ? "success" : "secondary"}>{r.is_active ? "Да" : "Нет"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => toggleRule(r)}>
                          {r.is_active ? "Откл." : "Вкл."}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Редактировать" onClick={() => { setEditingRule(r); setRuleDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Удалить"
                          onClick={() => removeRule(
                            { resource: "notifications/rules", id: r.id, successNotification: false },
                            { onSuccess: () => { toastStore.push({ message: "Правило удалено", type: "success" }); refreshRules(); } },
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <RuleFormDialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen} rule={editingRule} />
    </div>
  );
}
