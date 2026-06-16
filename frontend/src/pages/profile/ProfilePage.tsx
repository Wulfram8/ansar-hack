import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle, Avatar, Badge, Skeleton } from "@/shared/ui";

interface Identity {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string | null;
  role_name?: string | null;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function ProfilePage() {
  const { data: me, isLoading } = useGetIdentity<Identity>();

  if (isLoading || !me) return <Skeleton className="h-48 w-full max-w-2xl" />;

  const name = [me.last_name, me.first_name, me.middle_name].filter(Boolean).join(" ") || me.username || "Пользователь";
  const initials =
    [me.last_name?.[0], me.first_name?.[0]].filter(Boolean).join("").toUpperCase() ||
    (me.username?.slice(0, 2).toUpperCase() ?? "?");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Мой профиль</h1>
      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <Avatar initials={initials} size={48} />
          <div>
            <CardTitle>{name}</CardTitle>
            {me.role_name && <Badge variant="secondary" className="mt-1">{me.role_name}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Логин" value={me.username} />
          <Field label="Email" value={me.email} />
          <Field label="Телефон" value={me.phone} />
          <Field label="Роль" value={me.role_name} />
        </CardContent>
      </Card>
    </div>
  );
}
