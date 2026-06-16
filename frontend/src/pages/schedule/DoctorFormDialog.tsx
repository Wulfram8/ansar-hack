import { useEffect, useState } from "react";
import { useCreate, useInvalidate } from "@refinedev/core";
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
  toastStore,
} from "@/shared/ui";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
}

export function DoctorFormDialog({ open, onOpenChange, onSaved }: Props) {
  const invalidate = useInvalidate();
  const { mutate: create, isLoading } = useCreate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [cabinet, setCabinet] = useState("");
  const [color, setColor] = useState("#1e40af");

  useEffect(() => {
    if (!open) return;
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setSpecialty(""); setCabinet(""); setColor("#1e40af");
  }, [open]);

  const submit = () => {
    if (!lastName.trim()) return toastStore.push({ message: "Укажите фамилию", type: "error" });
    if (!specialty.trim()) return toastStore.push({ message: "Укажите специальность", type: "error" });
    create(
      {
        resource: "doctors",
        values: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          new_email: email.trim(),
          phone: phone.trim(),
          specialty: specialty.trim(),
          cabinet: cabinet.trim(),
          color_hex: color,
        },
        successNotification: false,
      },
      {
        onSuccess: () => {
          toastStore.push({ message: "Врач добавлен", type: "success" });
          invalidate({ resource: "doctors", invalidates: ["list"] });
          onSaved?.();
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const d = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
          const msg = d ? Object.values(d).flat().join(" ") : "Не удалось добавить врача";
          toastStore.push({ message: msg, type: "error" });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый врач</DialogTitle>
          <DialogDescription>Создаёт врача и связанную учётную запись.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Фамилия *</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Имя</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Специальность *</Label>
            <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Кардиолог" />
          </div>
          <div className="space-y-1.5">
            <Label>Кабинет</Label>
            <Input value={cabinet} onChange={(e) => setCabinet(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Телефон</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7..." />
          </div>
          <div className="space-y-1.5">
            <Label>Цвет в расписании</Label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-16 rounded border" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Отмена</Button>
          <Button onClick={submit} disabled={isLoading}>Добавить врача</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
