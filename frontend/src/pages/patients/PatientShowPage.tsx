import { useShow, useNavigation } from "@refinedev/core";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/ui";
import {
  type Patient,
  PATIENT_STATUS_LABELS,
  PATIENT_STATUS_VARIANTS,
  patientFullName,
} from "@/entities/patient";
import { formatDate, formatMoneyKopecks } from "@/shared/lib/utils";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function PatientShowPage() {
  const { list, edit } = useNavigation();
  const { queryResult } = useShow<Patient>({ resource: "patients" });
  const { data, isLoading } = queryResult;
  const patient = data?.data as Patient | undefined;

  if (isLoading || !patient) {
    return <Skeleton className="h-64 w-full max-w-3xl" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => list("patients")}>
          <ArrowLeft className="h-4 w-4" /> К списку
        </Button>
        <Button size="sm" onClick={() => edit("patients", patient.id)}>
          <Pencil className="h-4 w-4" /> Редактировать
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{patientFullName(patient)}</CardTitle>
          <Badge variant={PATIENT_STATUS_VARIANTS[patient.status]}>
            {PATIENT_STATUS_LABELS[patient.status]}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Field label="Телефон" value={patient.phone} />
          <Field label="Email" value={patient.email} />
          <Field label="Дата рождения" value={formatDate(patient.birth_date)} />
          <Field label="Адрес" value={patient.address} />
          <Field label="Последний визит" value={formatDate(patient.last_visit_date)} />
          <Field label="Следующий визит" value={formatDate(patient.next_visit_date)} />
          <Field label="Визитов" value={patient.visits_count} />
          <Field label="Средний чек" value={formatMoneyKopecks(patient.average_check_kopecks)} />
          <Field label="Выручка" value={formatMoneyKopecks(patient.total_revenue_kopecks)} />
        </CardContent>
      </Card>

      {patient.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Заметки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{patient.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
