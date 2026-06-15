import { useList } from "@refinedev/core";
import {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from "@/shared/ui";
import { type NotificationTemplate } from "@/entities/notification";

export function NotificationTemplatesPage() {
  const { data, isLoading } = useList<NotificationTemplate>({
    resource: "notifications/templates",
    pagination: { mode: "off" },
  });
  const items: NotificationTemplate[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Шаблоны уведомлений</h1>
        <p className="text-muted-foreground">Всего: {items.length}</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Текст</TableHead>
                <TableHead>Активен</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    Шаблоны не найдены
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.code}</TableCell>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">
                      {t.body}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.is_active ? "success" : "secondary"}>
                        {t.is_active ? "Да" : "Нет"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
