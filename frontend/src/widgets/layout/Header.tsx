import { useState } from "react";
import { useGetIdentity, useLogout, useNavigation } from "@refinedev/core";
import { Search, CircleHelp, Bell, LogOut, User } from "lucide-react";
import { toastStore } from "@/shared/ui";
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui";

interface Identity {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export function Header() {
  const { data: identity } = useGetIdentity<Identity>();
  const { mutate: logout } = useLogout();
  const { list } = useNavigation();
  const [query, setQuery] = useState("");

  const runSearch = () => {
    const q = query.trim();
    if (!q) return;
    // Глобальный поиск ведёт в список пациентов с предзаполненным запросом.
    window.location.assign(`/patients?search=${encodeURIComponent(q)}`);
  };

  const name =
    [identity?.last_name, identity?.first_name].filter(Boolean).join(" ") ||
    identity?.username ||
    "Пользователь";
  const initials =
    [identity?.last_name?.[0], identity?.first_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <header className="flex h-[60px] items-center justify-between gap-4 border-b bg-card px-6">
      {/* Глобальный поиск */}
      <div className="flex h-9 w-[380px] max-w-[40vw] items-center gap-2 rounded-md border bg-muted/50 px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Поиск пациентов, врачей, записей..."
        />
      </div>

      {/* Действия справа */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Помощь"
          onClick={() =>
            toastStore.push({
              message: "Справка",
              description: "Документация и поддержка скоро будут доступны здесь.",
            })
          }
        >
          <CircleHelp className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Уведомления"
            onClick={() => list("notification_templates")}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 rounded-full outline-none ring-ring focus-visible:ring-2"
              aria-label="Меню пользователя"
            >
              <Avatar initials={initials} size={36} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="leading-tight">
                <div className="text-sm font-medium">{name}</div>
                {identity?.email && (
                  <div className="text-xs font-normal text-muted-foreground">
                    {identity.email}
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="h-4 w-4" />
              Профиль
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
