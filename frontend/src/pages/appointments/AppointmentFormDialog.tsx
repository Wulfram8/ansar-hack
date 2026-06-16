import { useEffect, useMemo, useState } from "react";
import { useCreate, useUpdate, useInvalidate, useList } from "@refinedev/core";
import { Search } from "lucide-react";
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
  type Appointment,
  type AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
} from "@/entities/appointment";
import { type Patient, patientFullName } from "@/entities/patient";
import { useDoctors } from "@/pages/schedule/useScheduleBoard";
import { useServices } from "@/pages/leads/useLeadMeta";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointment?: Appointment | null;
}

const NONE = "__none__";

export function AppointmentFormDialog({ open, onOpenChange, appointment }: Props) {
  const isEdit = !!appointment;
  const doctors = useDoctors();
  const services = useServices();
  const invalidate = useInvalidate();
  const { mutate: create, isLoading: creating } = useCreate();
  const { mutate: update, isLoading: updating } = useUpdate();

  const [patientId, setPatientId] = useState("");
  const [patientLabel, setPatientLabel] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorUserId, setDoctorUserId] = useState("");
  const [service, setService] = useState(NONE);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("");
  const [cabinet, setCabinet] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("CREATED");
  const [comment, setComment] = useState("");

  // Поиск пациента (выпадающий список).
  const { data: patientResults } = useList<Patient>({
    resource: "patients",
    pagination: { current: 1, pageSize: 8 },
    filters: patientQuery ? [{ field: "search", operator: "contains", value: patientQuery }] : [],
    queryOptions: { enabled: open && patientQuery.length > 0 },
  });

  useEffect(() => {
    if (!open) return;
    if (appointment) {
      setPatientId(String(appointment.patient));
      setPatientLabel(appointment.patient_name ?? "Пациент");
      setDoctorUserId(String(appointment.doctor));
      setService(appointment.service ? String(appointment.service) : NONE);
      setDate(appointment.date ?? "");
      setStart(appointment.start_time?.slice(0, 5) ?? "10:00");
      setEnd(appointment.end_time?.slice(0, 5) ?? "");
      setCabinet(appointment.cabinet ?? "");
      setStatus(appointment.status);
      setComment(appointment.comment ?? "");
    } else {
      setPatientId(""); setPatientLabel(""); setPatientQuery("");
      setDoctorUserId(doctors[0]?.user ? String(doctors[0].user) : "");
      setService(NONE); setDate(""); setStart("10:00"); setEnd("");
      setCabinet(""); setStatus("CREATED"); setComment("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment]);

  const doctorOptions = useMemo(
    () => doctors.map((d) => ({ value: String(d.user), label: d.user_name, cabinet: d.cabinet })),
    [doctors],
  );

  const submit = () => {
    if (!patientId) return toastStore.push({ message: "Выберите пациента", type: "error" });
    if (!doctorUserId) return toastStore.push({ message: "Выберите врача", type: "error" });
    if (!date) return toastStore.push({ message: "Укажите дату", type: "error" });
    if (service === NONE && !end)
      return toastStore.push({ message: "Выберите услугу или укажите время окончания", type: "error" });

    const values: Record<string, unknown> = {
      patient: patientId,
      doctor: doctorUserId,
      service: service === NONE ? null : service,
      date,
      start_time: start,
      cabinet,
      status,
      comment,
    };
    if (end) values.end_time = end;

    const done = {
      onSuccess: () => {
        toastStore.push({ message: isEdit ? "Запись обновлена" : "Запись создана", type: "success" });
        invalidate({ resource: "appointments", invalidates: ["list"] });
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const detail =
          (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
        const msg = detail ? Object.values(detail).flat().join(" ") : "Не удалось сохранить запись";
        toastStore.push({ message: msg, type: "error" });
      },
    };

    if (isEdit && appointment) {
      update({ resource: "appointments", id: appointment.id, values, successNotification: false }, done);
    } else {
      create({ resource: "appointments", values, successNotification: false }, done);
    }
  };

  const busy = creating || updating;
  const showResults = open && patientQuery.length > 0 && (patientResults?.data?.length ?? 0) > 0 && !patientId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактирование записи" : "Новая запись"}</DialogTitle>
          <DialogDescription>Запись пациента на приём к врачу.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Пациент */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Пациент *</Label>
            {patientId ? (
              <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-medium">{patientLabel}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setPatientId(""); setPatientLabel(""); }}
                >
                  Изменить
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex h-9 items-center gap-2 rounded-md border bg-card px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={patientQuery}
                    onChange={(e) => setPatientQuery(e.target.value)}
                    placeholder="Поиск по ФИО или телефону..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                {showResults && (
                  <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                    {patientResults?.data?.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPatientId(String(p.id));
                          setPatientLabel(patientFullName(p));
                        }}
                        className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <span className="font-medium">{patientFullName(p)}</span>
                        <span className="text-xs text-muted-foreground">{p.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Врач *</Label>
            <Select value={doctorUserId} onValueChange={(v) => {
              setDoctorUserId(v);
              const found = doctorOptions.find((d) => d.value === v);
              if (found?.cabinet && !cabinet) setCabinet(found.cabinet);
            }}>
              <SelectTrigger><SelectValue placeholder="Выберите врача" /></SelectTrigger>
              <SelectContent>
                {doctorOptions.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Услуга</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger><SelectValue placeholder="Не выбрана" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Не выбрана</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Дата *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Начало *</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Конец</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Кабинет</Label>
            <Input value={cabinet} onChange={(e) => setCabinet(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Статус</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{APPOINTMENT_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Комментарий</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Отмена</Button>
          <Button onClick={submit} disabled={busy}>{isEdit ? "Сохранить" : "Создать запись"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
