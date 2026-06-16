import { useState } from "react";
import { useList, useDelete, useInvalidate } from "@refinedev/core";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  KeyRound,
  ShieldOff,
  Copy,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  toastStore,
} from "@/shared/ui";
import { http } from "@/shared/api/http";
import { EmployeeFormDialog, type Employee } from "./EmployeeFormDialog";

interface EmployeeRow extends Employee {
  role_name?: string | null;
  full_name?: string;
  has_token?: boolean;
}

export function EmployeesPage() {
  const invalidate = useInvalidate();
  const { mutate: remove } = useDelete();
  const { data, isLoading } = useList<EmployeeRow>({
    resource: "users",
    pagination: { mode: "off" },
  });
  const employees = data?.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  const refresh = () => invalidate({ resource: "users", invalidates: ["list"] });

  const generateToken = async (id: string) => {
    try {
      const { data } = await http.post<{ token: string }>(`/users/${id}/generate_token/`);
      setTokenValue(data.token);
      refresh();
    } catch {
      toastStore.push({ message: "Недостаточно прав для выпуска токена", type: "error" });
    }
  };

  const revokeToken = async (id: string) => {
    try {
      await http.post(`/users/${id}/revoke_token/`);
      toastStore.push({ message: "Токен отозван", type: "success" });
      refresh();
    } catch {
      toastStore.push({ message: "Не удалось отозвать токен", type: "error" });
    }
  };

  const initials = (e: EmployeeRow) =>
    [e.last_name?.[0], e.first_name?.[0]].filter(Boolean).join("").toUpperCase() ||
    e.username.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Сотрудники</h1>
            <Badge variant="secondary" className="rounded-full">{employees.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Пользователи системы, роли и API-токены
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          Новый сотрудник
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сотрудник</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>API-токен</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              )}
              {!isLoading && employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    Сотрудники не найдены
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && employees.map((e) => (
                <TableRow key={e.id} onClick={() => { setEditing(e); setDialogOpen(true); }} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={initials(e)} size={32} />
                      <div className="leading-tight">
                        <div className="font-medium">
                          {[e.last_name, e.first_name].filter(Boolean).join(" ") || e.username}
                        </div>
                        <div className="text-xs text-muted-foreground">@{e.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.email}</TableCell>
                  <TableCell>{e.phone || "—"}</TableCell>
                  <TableCell>
                    {e.role_name ? <Badge variant="secondary">{e.role_name}</Badge> : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={e.is_active ? "success" : "secondary"}>
                      {e.is_active ? "Активен" : "Отключён"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {e.has_token ? (
                      <Badge variant="outline">Выпущен</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(ev) => ev.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(e); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" /> Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => generateToken(e.id)}>
                          <KeyRound className="h-4 w-4" /> {e.has_token ? "Перевыпустить токен" : "Выпустить токен"}
                        </DropdownMenuItem>
                        {e.has_token && (
                          <DropdownMenuItem onClick={() => revokeToken(e.id)}>
                            <ShieldOff className="h-4 w-4" /> Отозвать токен
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            remove(
                              { resource: "users", id: e.id, successNotification: false },
                              { onSuccess: () => { toastStore.push({ message: "Сотрудник удалён", type: "success" }); refresh(); } },
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" /> Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} employee={editing} />

      {/* Окно показа выпущенного токена */}
      <Dialog open={!!tokenValue} onOpenChange={(v) => !v && setTokenValue(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API-токен выпущен</DialogTitle>
            <DialogDescription>
              Скопируйте токен сейчас — он используется в заголовке Authorization: Token.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3">
            <code className="flex-1 break-all text-xs">{tokenValue}</code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (tokenValue) navigator.clipboard?.writeText(tokenValue);
                toastStore.push({ message: "Токен скопирован", type: "success" });
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setTokenValue(null)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
