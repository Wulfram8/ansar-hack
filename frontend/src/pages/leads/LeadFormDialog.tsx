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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toastStore,
} from "@/shared/ui";
import {
  type Lead,
  type LeadChannel,
  type LeadStatus,
  LEAD_CHANNEL_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_PIPELINE,
} from "@/entities/lead";
import { useLeadSources, useAdmins, useServices } from "./useLeadMeta";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead | null;
  defaultStatus?: LeadStatus;
}

const NONE = "__none__";

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  channel: LeadChannel;
  status: LeadStatus;
  source: string;
  service_interest: string;
  assigned_admin: string;
  estimated_value_rub: string;
  notes: string;
  hot: boolean;
}

function emptyForm(status: LeadStatus = "NEW"): FormState {
  return {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    channel: "CALL",
    status,
    source: NONE,
    service_interest: NONE,
    assigned_admin: NONE,
    estimated_value_rub: "",
    notes: "",
    hot: false,
  };
}

export function LeadFormDialog({ open, onOpenChange, lead, defaultStatus }: Props) {
  const isEdit = !!lead;
  const sources = useLeadSources();
  const admins = useAdmins();
  const services = useServices();
  const invalidate = useInvalidate();
  const { mutate: create, isLoading: creating } = useCreate();
  const { mutate: update, isLoading: updating } = useUpdate();
  const [form, setForm] = useState<FormState>(emptyForm(defaultStatus));

  useEffect(() => {
    if (!open) return;
    if (lead) {
      setForm({
        first_name: lead.first_name ?? "",
        last_name: lead.last_name ?? "",
        phone: lead.phone ?? "",
        email: lead.email ?? "",
        channel: lead.channel,
        status: lead.status,
        source: (lead.source as string) ?? NONE,
        service_interest: (lead.service_interest as string) ?? NONE,
        assigned_admin: (lead.assigned_admin as string) ?? NONE,
        estimated_value_rub: lead.estimated_value_kopecks
          ? String(Math.round(lead.estimated_value_kopecks / 100))
          : "",
        notes: lead.notes ?? "",
        hot: !!lead.hot,
      });
    } else {
      setForm(emptyForm(defaultStatus));
    }
  }, [open, lead, defaultStatus]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.first_name.trim()) {
      toastStore.push({ message: "Укажите имя лида", type: "error" });
      return;
    }
    const values = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      channel: form.channel,
      status: form.status,
      source: form.source === NONE ? null : form.source,
      service_interest: form.service_interest === NONE ? null : form.service_interest,
      assigned_admin: form.assigned_admin === NONE ? null : form.assigned_admin,
      estimated_value_kopecks: Math.round((Number(form.estimated_value_rub) || 0) * 100),
      notes: form.notes,
      utm: { hot: form.hot },
    };

    const done = {
      onSuccess: () => {
        toastStore.push({
          message: isEdit ? "Лид обновлён" : "Лид создан",
          type: "success",
        });
        invalidate({ resource: "leads", invalidates: ["list"] });
        onOpenChange(false);
      },
      onError: () => toastStore.push({ message: "Не удалось сохранить лид", type: "error" }),
    };

    if (isEdit && lead) {
      update({ resource: "leads", id: lead.id, values, successNotification: false }, done);
    } else {
      create({ resource: "leads", values, successNotification: false }, done);
    }
  };

  const busy = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактирование лида" : "Новый лид"}</DialogTitle>
          <DialogDescription>
            Заполните данные заявки. Имя обязательно.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] gap-4 overflow-y-auto px-0.5 py-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Имя *</Label>
            <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Фамилия</Label>
            <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Телефон</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+7..." />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Канал</Label>
            <Select value={form.channel} onValueChange={(v) => set("channel", v as LeadChannel)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(LEAD_CHANNEL_LABELS) as LeadChannel[]).map((c) => (
                  <SelectItem key={c} value={c}>{LEAD_CHANNEL_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Стадия</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as LeadStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_PIPELINE.map((s) => (
                  <SelectItem key={s} value={s}>{LEAD_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Источник</Label>
            <Select value={form.source} onValueChange={(v) => set("source", v)}>
              <SelectTrigger><SelectValue placeholder="Не указан" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Не указан</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Интерес (услуга)</Label>
            <Select value={form.service_interest} onValueChange={(v) => set("service_interest", v)}>
              <SelectTrigger><SelectValue placeholder="Не выбрано" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Не выбрано</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ответственный</Label>
            <Select value={form.assigned_admin} onValueChange={(v) => set("assigned_admin", v)}>
              <SelectTrigger><SelectValue placeholder="Не назначен" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Не назначен</SelectItem>
                {admins.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {[a.last_name, a.first_name].filter(Boolean).join(" ") || a.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Оценочная сумма, ₽</Label>
            <Input
              type="number"
              value={form.estimated_value_rub}
              onChange={(e) => set("estimated_value_rub", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Заметки</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.hot}
              onChange={(e) => set("hot", e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Горячий лид
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={busy}>
            {isEdit ? "Сохранить" : "Создать лид"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
