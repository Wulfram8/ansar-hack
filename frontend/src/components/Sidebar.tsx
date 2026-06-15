import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import {
  LayoutDashboard, Users, Calendar, Clock, ClipboardList,
  MessageSquare, BarChart3, Megaphone, Bell, Bot, UserCog, Settings, LogOut, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const platformItems = [
  { name: "Дашборд", href: "/", icon: LayoutDashboard },
  { name: "Пациенты", href: "/patients", icon: Users },
  { name: "Записи", href: "/appointments", icon: Calendar },
  { name: "Расписание врачей", href: "/schedule", icon: Clock },
  { name: "Лиды", href: "/leads", icon: ClipboardList },
  { name: "Коммуникации", href: "/communications", icon: MessageSquare },
]

const analyticsItems = [
  { name: "Аналитика", href: "/analytics", icon: BarChart3 },
  { name: "Маркетинг", href: "/marketing", icon: Megaphone },
  { name: "Уведомления", href: "/notifications", icon: Bell },
  { name: "AI Ассистент", href: "/ai", icon: Bot },
]

const systemItems = [
  { name: "Сотрудники", href: "/users", icon: UserCog },
  { name: "Настройки", href: "/settings", icon: Settings },
]

function NavItem({ item }: { item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> } }) {
  const location = useLocation()
  const Icon = item.icon
  const isActive = location.pathname === item.href
  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
        isActive ? "bg-neutral-100 font-medium text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{item.name}</span>
    </Link>
  )
}

function NavSection({ title, items }: { title: string; items: typeof platformItems }) {
  return (
    <div>
      <p className="px-2 pt-3 pb-1 text-xs font-medium text-neutral-500">{title}</p>
      {items.map(item => <NavItem key={item.href} item={item} />)}
    </div>
  )
}

export function Sidebar() {
  const { username, logout } = useAuth()

  return (
    <div className="w-64 border-r bg-neutral-50 flex flex-col h-screen">
      {/* Brand */}
      <div className="flex items-center gap-2 p-2 m-2 rounded-md">
        <div className="w-8 h-8 rounded-md bg-neutral-900 flex items-center justify-center">
          <Activity className="w-4 h-4 text-neutral-50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">MediCRM</p>
          <p className="text-xs text-neutral-500 truncate">Клиника «Здоровье»</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        <NavSection title="Платформа" items={platformItems} />
        <NavSection title="Аналитика и маркетинг" items={analyticsItems} />
        <NavSection title="Система" items={systemItems} />
      </nav>

      {/* User footer */}
      <div className="border-t p-2 m-2 mt-0">
        <div className="flex items-center gap-2 p-2 rounded-md">
          <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-xs font-semibold text-neutral-50">
            {username?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{username}</p>
          </div>
          <button onClick={logout} className="text-neutral-500 hover:text-neutral-900">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
