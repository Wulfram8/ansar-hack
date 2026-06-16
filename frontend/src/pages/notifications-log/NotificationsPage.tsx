import { useMemo, useState } from "react";
import { useList, useUpdate, useInvalidate } from "@refinedev/core";
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
import {
  type AutomationRule,
  type ScheduledNotification,
  type NotificationTemplate,
  TRIGGER_KIND_LABELS,
  SCHEDULED_STATUS_LABELS,
  type ScheduledStatus,
} from "@/entities/notification";

type TabKey = "scheduled" | "rules";

const STATUS_VARIANT: Record<ScheduledStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  SENT: "success",
  FAILED: "destructive",
  CANCELLED: "secondary",
};

export function NotificationsPage() {
  const [tab, setTab] = useState<TabKey>("scheduled");

  const { data: scheduledData, isLoading: scheduledLoading } = useList<ScheduledNotification>({
    resource: "notifications/scheduled",
    pagination: { mode: "off" },
  });
  const { data: rulesData, isLoading: rulesLoading } = useList<AutomationRule>({
    resource: "notifications/rules",
    pagination: { mode: "off" },
  });
  const { data: templatesData } = useList<NotificationTemplate>({
    resource: "notifications/templates",
    pagination: { mode: "off" },
  });

  const invalidate = useInvalidate();
  const { mutate: update } = useUpdate();

  const templateMap = useMemo(() => {
    const m = new Map<string, string>();
    (templatesData?.data ?? []).forEach((t) => m.set(String(t.id), t.title));
    return m;
  }, [templatesData]);

  const scheduled = scheduledData?.data ?? [];
  const rules = rulesData?.data ?? [];

  const toggleRule = (rule: AutomationRule) => {
    update(
      {
        resource: "notifications/rules",
        id: rule.id,
        values: { is_active: !rule.is_active },
        successNotification: false,
      },
      {
        onSuccess: () => {
          toastStore.push({ message: "Правило обновлено", type: "success" });
          invalidate({ resource: "notifications/rules", invalidates: ["list"] });
        },
        onError: () => toastStore.push({ message: "Не удалось обновить", type: "error" }),
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Уведомления</h1>
        <p className="text-sm text-muted-foreground">
          Запланированные рассылки и правила автоматизации
        </p>
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
                  <TableHead>Канал</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Попытки</TableHead>
                  <TableHead>Ошибка</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledLoading && (
                  <TableRow><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                )}
                {!scheduledLoading && scheduled.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      Нет запланированных уведомлений
                    </TableCell>
                  </TableRow>
                )}
                {!scheduledLoading && scheduled.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{formatDateTime(n.send_at)}</TableCell>
                    <TableCell className="text-muted-foreground">{n.channel ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[n.status]}>{SCHEDULED_STATUS_LABELS[n.status]}</Badge>
                    </TableCell>
                    <TableCell>{n.attempts}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{n.last_error || "—"}</TableCell>
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
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesLoading && (
                  <TableRow><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                )}
                {!rulesLoading && rules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      Правил пока нет
                    </TableCell>
                  </TableRow>
                )}
                {!rulesLoading && rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{templateMap.get(String(r.template)) ?? "—"}</TableCell>
                    <TableCell>{TRIGGER_KIND_LABELS[r.trigger_kind]}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.offset_minutes > 0 ? `+${r.offset_minutes}` : r.offset_minutes} мин
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.is_active ? "success" : "secondary"}>
                        {r.is_active ? "Да" : "Нет"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => toggleRule(r)}>
                        {r.is_active ? "Отключить" : "Включить"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
