import { Sidebar } from "./Sidebar"
import { Outlet, useLocation } from "react-router-dom"
import { Search, Bell, Sun, HelpCircle } from "lucide-react"

const pageTitles: Record<string, string> = {
  "/": "Дашборд",
  "/patients": "Пациенты",
  "/appointments": "Записи на приём",
  "/schedule": "Расписание врачей",
  "/leads": "Лиды",
  "/communications": "Коммуникации",
  "/analytics": "Аналитика",
  "/marketing": "Маркетинг",
  "/notifications": "Уведомления",
  "/ai": "AI Ассистент",
  "/users": "Сотрудники",
  "/settings": "Настройки",
}

export function Layout() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || "MediCRM"

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="h-16 border-b flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm text-neutral-500 w-72">
              <Search className="w-4 h-4" />
              <span>Поиск...</span>
            </div>
            <button className="border rounded-md w-9 h-9 flex items-center justify-center hover:bg-neutral-100">
              <Sun className="w-4 h-4 text-neutral-500" />
            </button>
            <button className="border rounded-md w-9 h-9 flex items-center justify-center hover:bg-neutral-100">
              <Bell className="w-4 h-4 text-neutral-500" />
            </button>
            <button className="border rounded-md w-9 h-9 flex items-center justify-center hover:bg-neutral-100">
              <HelpCircle className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
