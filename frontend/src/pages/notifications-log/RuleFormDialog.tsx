import { useEffect, useState } from "react";
import { useCreate, useUpdate, useInvalidate, useList } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toastStore,
} from "@/shared/ui";
import {
  type AutomationRule,
  type TriggerKind,
  type NotificationTemplate,
  TRIGGER_KIND_LABELS,
} from "@/entities/notification";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule?: AutomationRule | null;
}

export function RuleFormDialog({ open, onOpenChange, rule }: Props) {
  const isEdit = !!rule;
  const invalidate = useInvalidate();
  const { mutate: create, isLoading: creating } = useCreate();
  const { mutate: update, isLoading: updating } = useUpdate();
  const { data: templatesData } = useList<NotificationTemplate>({
    resource: "notifications/templates",
    pagination: { mode: "off" },
  });
  const templates = templatesData?.data ?? [];

  const [template, setTemplate] = useState("");
  const [trigger, setTrigger] = useState<TriggerKind>("BEFORE_APPOINTMENT");
  const [offset, setOffset] = useState("0");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (rule) {
      setTemplate(String(rule.template));
      setTrigger(rule.trigger_kind);
      setOffset(String(rule.offset_minutes));
      setActive(rule.is_active);
    } else {
      setTemplate(templates[0]?.id ?? "");
      setTrigger("BEFORE_APPOINTMENT");
      setOffset("0");
      setActive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rule]);

  const submit = () => {
    if (!template) return toastStore.push({ message: "Выберите шаблон", type: "error" });
    const values = {
      template,
      trigger_kind: trigger,
      offset_minutes: Number(offset) || 0,
      is_active: active,
    };
    const done = {
      onSuccess: () => {
        toastStore.push({ message: isEdit ? "Правило обновлено" : "Правило создано", type: "success" });
        invalidate({ resource: "notifications/rules", invalidates: ["list"] });
        onOpenChange(false);
      },
      onError: () => toastStore.push({ message: "Не удалось сохранить правило", type: "error" }),
    };
    if (isEdit && rule) {
      update({ resource: "notifications/rules", id: rule.id, values, successNotification: false }, done);
    } else {
      create({ resource: "notifications/rules", values, successNotification: false }, done);
    }
  };

  const busy = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактирование правила" : "Новое правило"}</DialogTitle>
          <DialogDescription>
            Правило автоматически планирует уведомление по событию.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Шаблон</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger><SelectValue placeholder="Выберите шаблон" /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Триггер</Label>
            <Select value={trigger} onValueChange={(v) => setTrigger(v as TriggerKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(TRIGGER_KIND_LABELS) as TriggerKind[]).map((k) => (
                  <SelectItem key={k} value={k}>{TRIGGER_KIND_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Смещение, минут (отрицательное — до события)</Label>
            <Input type="number" value={offset} onChange={(e) => setOffset(e.target.value)} placeholder="-1440" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-input" />
            Активно
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Отмена</Button>
          <Button onClick={submit} disabled={busy}>{isEdit ? "Сохранить" : "Создать"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
