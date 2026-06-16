import { Controller } from "react-hook-form";
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation } from "@refinedev/core";
import { ArrowLeft, User, Phone as PhoneIcon, Tag as TagIcon } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DatePicker,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import {
  type Patient,
  PATIENT_STATUS_LABELS,
  type PatientStatus,
} from "@/entities/patient";
import { usePatientSources, usePatientTags } from "./usePatientMeta";

interface PatientFormProps {
  action: "create" | "edit";
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

export function PatientForm({ action }: PatientFormProps) {
  const { list } = useNavigation();
  const sources = usePatientSources();
  const tags = usePatientTags();

  const {
    refineCore: { onFinish, formLoading },
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Patient>({
    refineCoreProps: { resource: "patients", action },
    defaultValues: { status: "NEW" as PatientStatus },
  });

  const selectedTags: string[] = (watch("tags") as string[] | undefined) ?? [];
  const toggleTag = (id: string) =>
    setValue(
      "tags",
      selectedTags.includes(id)
        ? selectedTags.filter((t) => t !== id)
        : [...selectedTags, id],
      { shouldDirty: true },
    );

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => list("patients")}>
        <ArrowLeft className="h-4 w-4" /> К списку
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {action === "create" ? "Новый пациент" : "Редактирование пациента"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Заполните данные пациента. Поля со звёздочкой обязательны.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFinish)} className="space-y-8">
            {/* Личные данные */}
            <section className="space-y-4">
              <SectionTitle icon={User}>Личные данные</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Фамилия" required error={errors.last_name?.message as string}>
                  <Input {...register("last_name", { required: "Обязательное поле" })} />
                </Field>
                <Field label="Имя" required error={errors.first_name?.message as string}>
                  <Input {...register("first_name", { required: "Обязательное поле" })} />
                </Field>
                <Field label="Отчество">
                  <Input {...register("middle_name")} />
                </Field>
                <Field label="Дата рождения">
                  <Controller
                    control={control}
                    name="birth_date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value as string | null | undefined}
                        onChange={field.onChange}
                        placeholder="дд.мм.гггг"
                      />
                    )}
                  />
                </Field>
                <Field label="Пол">
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Не указан" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Мужской</SelectItem>
                          <SelectItem value="female">Женский</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Статус">
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(PATIENT_STATUS_LABELS) as PatientStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>
                              {PATIENT_STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
            </section>

            {/* Контакты */}
            <section className="space-y-4">
              <SectionTitle icon={PhoneIcon}>Контакты</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Телефон" required error={errors.phone?.message as string}>
                  <Input
                    placeholder="+7 (___) ___-__-__"
                    {...register("phone", { required: "Обязательное поле" })}
                  />
                </Field>
                <Field label="Email">
                  <Input type="email" placeholder="name@example.com" {...register("email")} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Адрес">
                    <Input {...register("address")} />
                  </Field>
                </div>
              </div>
            </section>

            {/* Дополнительно */}
            <section className="space-y-4">
              <SectionTitle icon={TagIcon}>Дополнительно</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Источник">
                  <Controller
                    control={control}
                    name="source"
                    render={({ field }) => (
                      <Select
                        value={(field.value as string) || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите источник" />
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>

              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Теги</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => {
                      const active = selectedTags.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTag(t.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                            active
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "bg-background hover:bg-accent",
                          )}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: active ? "currentColor" : t.color }}
                          />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Field label="Заметки">
                <Textarea rows={3} {...register("notes")} />
              </Field>
            </section>

            <div className="flex justify-end gap-2 border-t pt-4">
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
