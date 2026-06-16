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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toastStore,
} from "@/shared/ui";
import { useRoles } from "./useEmployeeMeta";

export interface Employee {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string | null;
  is_active: boolean;
  role?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee?: Employee | null;
}

const NONE = "__none__";

export function EmployeeFormDialog({ open, onOpenChange, employee }: Props) {
  const isEdit = !!employee;
  const roles = useRoles();
  const invalidate = useInvalidate();
  const { mutate: create, isLoading: creating } = useCreate();
  const { mutate: update, isLoading: updating } = useUpdate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(NONE);
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (employee) {
      setUsername(employee.username ?? "");
      setEmail(employee.email ?? "");
      setFirstName(employee.first_name ?? "");
      setLastName(employee.last_name ?? "");
      setMiddleName(employee.middle_name ?? "");
      setPhone(employee.phone ?? "");
      setRole((employee.role as string) ?? NONE);
      setIsActive(employee.is_active);
      setPassword("");
    } else {
      setUsername(""); setEmail(""); setFirstName(""); setLastName("");
      setMiddleName(""); setPhone(""); setRole(NONE); setPassword(""); setIsActive(true);
    }
  }, [open, employee]);

  const submit = () => {
    if (!username.trim()) return toastStore.push({ message: "Укажите логин", type: "error" });
    if (!email.trim()) return toastStore.push({ message: "Укажите email", type: "error" });
    if (!isEdit && !password) return toastStore.push({ message: "Задайте пароль", type: "error" });

    const values: Record<string, unknown> = {
      username: username.trim(),
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      middle_name: middleName.trim(),
      phone: phone.trim(),
      role: role === NONE ? null : role,
      is_active: isActive,
    };
    if (password) values.password = password;

    const done = {
      onSuccess: () => {
        toastStore.push({ message: isEdit ? "Сотрудник обновлён" : "Сотрудник добавлен", type: "success" });
        invalidate({ resource: "users", invalidates: ["list"] });
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const d = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
        const msg = d ? Object.entries(d).map(([k, v]) => `${k}: ${[v].flat().join(" ")}`).join("; ") : "Не удалось сохранить";
        toastStore.push({ message: msg, type: "error" });
      },
    };

    if (isEdit && employee) {
      update({ resource: "users", id: employee.id, values, successNotification: false }, done);
    } else {
      create({ resource: "users", values, successNotification: false }, done);
    }
  };

  const busy = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактирование сотрудника" : "Новый сотрудник"}</DialogTitle>
          <DialogDescription>Логин и email обязательны. Роль определяет права доступа.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Логин *</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Фамилия</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Имя</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Отчество</Label>
            <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Телефон</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7..." />
          </div>
          <div className="space-y-1.5">
            <Label>Роль</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Не задана" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Не задана</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{isEdit ? "Новый пароль" : "Пароль *"}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "оставьте пустым" : ""}
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Активен
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Отмена</Button>
          <Button onClick={submit} disabled={busy}>{isEdit ? "Сохранить" : "Добавить"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
