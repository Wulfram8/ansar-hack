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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toastStore,
} from "@/shared/ui";
import { useDoctors } from "./useScheduleBoard";

type Mode = "shift" | "timeoff";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  onSaved?: () => void;
}

const WEEKDAYS = [
  { v: "0", label: "Понедельник" },
  { v: "1", label: "Вторник" },
  { v: "2", label: "Среда" },
  { v: "3", label: "Четверг" },
  { v: "4", label: "Пятница" },
  { v: "5", label: "Суббота" },
  { v: "6", label: "Воскресенье" },
];

const EXC_TYPES = [
  { v: "VACATION", label: "Отпуск" },
  { v: "SICK", label: "Больничный" },
  { v: "DAY_OFF", label: "Выходной" },
  { v: "BLOCKED", label: "Недоступен" },
];

export function ScheduleFormDialog({ open, onOpenChange, mode, onSaved }: Props) {
  const doctors = useDoctors();
  const invalidate = useInvalidate();
  const { mutate: create, isLoading } = useCreate();

  const [doctor, setDoctor] = useState("");
  // shift fields
  const [weekday, setWeekday] = useState("0");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  // timeoff fields
  const [excType, setExcType] = useState("VACATION");
  const [dateFrom, setDateFrom] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && doctors.length && !doctor) setDoctor(doctors[0].id);
  }, [open, doctors, doctor]);

  const submit = () => {
    if (!doctor) {
      toastStore.push({ message: "Выберите врача", type: "error" });
      return;
    }
    const resource = mode === "shift" ? "schedules/shifts" : "schedules/exceptions";
    const values =
      mode === "shift"
        ? { doctor, weekday: Number(weekday), start_time: start, end_time: end }
        : { doctor, type: excType, date: dateFrom, reason };

    if (mode === "timeoff" && !dateFrom) {
      toastStore.push({ message: "Укажите дату", type: "error" });
      return;
    }

    create(
      { resource, values, successNotification: false },
      {
        onSuccess: () => {
          toastStore.push({
            message: mode === "shift" ? "Смена добавлена" : "Отсутствие добавлено",
            type: "success",
          });
          invalidate({ resource, invalidates: ["list"] });
          onSaved?.();
          onOpenChange(false);
        },
        onError: () =>
          toastStore.push({ message: "Не удалось сохранить", type: "error" }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "shift" ? "Новая смена" : "Отпуск / отсутствие"}</DialogTitle>
          <DialogDescription>
            {mode === "shift"
              ? "Регулярная рабочая смена врача по дню недели."
              : "Отметьте отпуск, больничный или выходной врача."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Врач</Label>
            <Select value={doctor} onValueChange={setDoctor}>
              <SelectTrigger><SelectValue placeholder="Выберите врача" /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.user_name} · {d.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === "shift" ? (
            <>
              <div className="space-y-1.5">
                <Label>День недели</Label>
                <Select value={weekday} onValueChange={setWeekday}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((w) => (
                      <SelectItem key={w.v} value={w.v}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Начало</Label>
                  <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Окончание</Label>
                  <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Select value={excType} onValueChange={setExcType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXC_TYPES.map((t) => (
                      <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Дата</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Причина</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={isLoading}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
