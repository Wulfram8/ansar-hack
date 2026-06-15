import { NavLink } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { Activity } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui";
import { NAV_ITEMS } from "./navigation";

interface Identity {
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: { name?: string } | null;
}

export function Sidebar() {
  const { data: identity } = useGetIdentity<Identity>();

  const userName =
    [identity?.last_name, identity?.first_name].filter(Boolean).join(" ") ||
    identity?.username ||
    "Пользователь";
  const userRole = identity?.role?.name ?? "Сотрудник";
  const initials =
    [identity?.last_name?.[0], identity?.first_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
      {/* Бренд */}
      <div className="flex h-[60px] items-center gap-2.5 border-b px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">МедКлиника CRM</div>
          <div className="text-xs text-muted-foreground">Управление</div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">
          Основное
        </div>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const content = (
              <>
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </>
            );
            return (
              <li key={item.label}>
                {item.to ? (
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )
                    }
                  >
                    {content}
                  </NavLink>
                ) : (
                  <span
                    title="Раздел в разработке"
                    className="flex cursor-default items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground/60"
                  >
                    {content}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Профиль пользователя */}
      <div className="flex items-center gap-3 border-t p-3">
        <Avatar initials={initials} size={36} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold">{userName}</div>
          <div className="truncate text-xs text-muted-foreground">{userRole}</div>
        </div>
      </div>
    </aside>
  );
}
