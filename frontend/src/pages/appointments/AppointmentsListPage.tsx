import { useState } from "react";
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
import {
  type Appointment,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_VARIANTS,
} from "@/entities/appointment";
import { DEFAULT_PAGE_SIZE } from "@/shared/config";
import { formatDate } from "@/shared/lib/utils";

export function AppointmentsListPage() {
  const [page] = useState(1);
  const { data, isLoading } = useList<Appointment>({
    resource: "appointments",
    pagination: { current: page, pageSize: DEFAULT_PAGE_SIZE },
    sorters: [{ field: "date", order: "desc" }],
  });
  const items: Appointment[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Записи на приём</h1>
        <p className="text-muted-foreground">Всего: {data?.total ?? 0}</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Пациент</TableHead>
                <TableHead>Врач</TableHead>
                <TableHead>Кабинет</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Записи не найдены
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{formatDate(a.date)}</TableCell>
                    <TableCell>
                      {a.start_time?.slice(0, 5)}–{a.end_time?.slice(0, 5)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.patient}</TableCell>
                    <TableCell className="font-mono text-xs">{a.doctor}</TableCell>
                    <TableCell>{a.cabinet || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={APPOINTMENT_STATUS_VARIANTS[a.status]}>
                        {APPOINTMENT_STATUS_LABELS[a.status]}
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
