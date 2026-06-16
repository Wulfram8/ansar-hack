import { useState } from "react";
import { useList, useUpdate, useDelete, useInvalidate } from "@refinedev/core";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  toastStore,
} from "@/shared/ui";
import { type NotificationTemplate } from "@/entities/notification";
import { TemplateFormDialog } from "./TemplateFormDialog";

export function NotificationTemplatesPage() {
  const invalidate = useInvalidate();
  const { mutate: update } = useUpdate();
  const { mutate: remove } = useDelete();
  const { data, isLoading } = useList<NotificationTemplate>({
    resource: "notifications/templates",
    pagination: { mode: "off" },
  });
  const items = data?.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);

  const refresh = () => invalidate({ resource: "notifications/templates", invalidates: ["list"] });

  const toggle = (t: NotificationTemplate) =>
    update(
      { resource: "notifications/templates", id: t.id, values: { is_active: !t.is_active }, successNotification: false },
      {
        onSuccess: () => { toastStore.push({ message: "Шаблон обновлён", type: "success" }); refresh(); },
        onError: () => toastStore.push({ message: "Не удалось обновить", type: "error" }),
      },
    );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Шаблоны уведомлений</h1>
          <p className="text-sm text-muted-foreground">Тексты для SMS, email и мессенджеров · всего {items.length}</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" /> Новый шаблон
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Текст</TableHead>
                <TableHead>Правил</TableHead>
                <TableHead>Активен</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Шаблоны не найдены — создайте первый
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.map((t) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => { setEditing(t); setDialogOpen(true); }}>
                  <TableCell className="font-mono text-xs">{t.code}</TableCell>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{t.body}</TableCell>
                  <TableCell className="text-muted-foreground">{t.rules_count ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={t.is_active ? "success" : "secondary"}>{t.is_active ? "Да" : "Нет"}</Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => toggle(t)}>
                        {t.is_active ? "Откл." : "Вкл."}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Редактировать" onClick={() => { setEditing(t); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Удалить"
                        onClick={() => remove(
                          { resource: "notifications/templates", id: t.id, successNotification: false },
                          { onSuccess: () => { toastStore.push({ message: "Шаблон удалён", type: "success" }); refresh(); } },
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TemplateFormDialog open={dialogOpen} onOpenChange={setDialogOpen} template={editing} />
    </div>
  );
}
