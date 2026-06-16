import { useEffect, useState } from "react";
import { useCreate, useUpdate, useInvalidate } from "@refinedev/core";
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
  Textarea,
  toastStore,
} from "@/shared/ui";
import { type NotificationTemplate } from "@/entities/notification";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template?: NotificationTemplate | null;
}

export function TemplateFormDialog({ open, onOpenChange, template }: Props) {
  const isEdit = !!template;
  const invalidate = useInvalidate();
  const { mutate: create, isLoading: creating } = useCreate();
  const { mutate: update, isLoading: updating } = useUpdate();

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (template) {
      setCode(template.code ?? "");
      setTitle(template.title ?? "");
      setBody(template.body ?? "");
      setActive(template.is_active);
    } else {
      setCode(""); setTitle(""); setBody(""); setActive(true);
    }
  }, [open, template]);

  const submit = () => {
    if (!code.trim()) return toastStore.push({ message: "Укажите код", type: "error" });
    if (!title.trim()) return toastStore.push({ message: "Укажите название", type: "error" });
    const values = { code: code.trim(), title: title.trim(), body, is_active: active };
    const done = {
      onSuccess: () => {
        toastStore.push({ message: isEdit ? "Шаблон обновлён" : "Шаблон создан", type: "success" });
        invalidate({ resource: "notifications/templates", invalidates: ["list"] });
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const d = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
        const msg = d ? Object.values(d).flat().join(" ") : "Не удалось сохранить шаблон";
        toastStore.push({ message: msg, type: "error" });
      },
    };
    if (isEdit && template) {
      update({ resource: "notifications/templates", id: template.id, values, successNotification: false }, done);
    } else {
      create({ resource: "notifications/templates", values, successNotification: false }, done);
    }
  };

  const busy = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактирование шаблона" : "Новый шаблон"}</DialogTitle>
          <DialogDescription>
            Используйте переменные вида {"{{patient_name}}"}, {"{{date}}"} в тексте.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Код</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="reminder_24h" disabled={isEdit} />
            </div>
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Текст</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-input" />
            Активен
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
