import { useForm } from "@refinedev/react-hook-form";
import { useNavigation } from "@refinedev/core";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui";
import { type Patient, PATIENT_STATUS_LABELS, type PatientStatus } from "@/entities/patient";
import { cn } from "@/shared/lib/utils";

interface PatientFormProps {
  action: "create" | "edit";
}

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function PatientForm({ action }: PatientFormProps) {
  const { list } = useNavigation();
  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Patient>({ refineCoreProps: { resource: "patients", action } });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => list("patients")}>
        <ArrowLeft className="h-4 w-4" /> К списку
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {action === "create" ? "Новый пациент" : "Редактирование пациента"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFinish)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="last_name">Фамилия *</Label>
                <Input id="last_name" {...register("last_name", { required: "Обязательное поле" })} />
                {errors.last_name && (
                  <p className="text-xs text-destructive">{String(errors.last_name.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">Имя *</Label>
                <Input id="first_name" {...register("first_name", { required: "Обязательное поле" })} />
                {errors.first_name && (
                  <p className="text-xs text-destructive">{String(errors.first_name.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle_name">Отчество</Label>
                <Input id="middle_name" {...register("middle_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input id="phone" {...register("phone", { required: "Обязательное поле" })} />
                {errors.phone && (
                  <p className="text-xs text-destructive">{String(errors.phone.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Дата рождения</Label>
                <Input id="birth_date" type="date" {...register("birth_date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Пол</Label>
                <select id="gender" className={cn(selectClass)} {...register("gender")}>
                  <option value="">—</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <select id="status" className={cn(selectClass)} {...register("status")}>
                  {(Object.keys(PATIENT_STATUS_LABELS) as PatientStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {PATIENT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input id="address" {...register("address")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => list("patients")}>
                Отмена
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
