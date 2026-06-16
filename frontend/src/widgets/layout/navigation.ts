import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  UserPlus,
  MessageSquare,
  Bell,
  Sparkles,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Маршрут. Если не задан — пункт показывается, но пока не реализован. */
  to?: string;
  /** Числовой бейдж справа от пункта (статичный). */
  badge?: number;
  /** Ключ живого счётчика — значение бейджа берётся из данных в Sidebar. */
  badgeKey?: "appointmentsToday" | "newLeads";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Боковое меню по дизайну CRM (Pencil P3VsS2 — «CRM/Main Analytics Dashboard»).
 * Все разделы доступны всем пользователям, без разделения по ролям.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Основное",
    items: [
      { to: "/", label: "Дашборд", icon: LayoutDashboard },
      { to: "/patients", label: "Пациенты", icon: Users },
      { to: "/appointments", label: "Записи", icon: CalendarCheck, badgeKey: "appointmentsToday" },
      { to: "/schedule", label: "Расписание врачей", icon: CalendarDays },
      { to: "/leads", label: "Лиды", icon: UserPlus, badgeKey: "newLeads" },
    ],
  },
  {
    title: "Автоматизация",
    items: [
      { to: "/notifications/templates", label: "Шаблоны уведомлений", icon: MessageSquare },
      { to: "/notifications", label: "Уведомления", icon: Bell },
      { to: "/assistant", label: "AI Ассистент", icon: Sparkles },
    ],
  },
  {
    title: "Система",
    items: [
      { to: "/employees", label: "Сотрудники", icon: UserCog },
      { to: "/settings", label: "Настройки", icon: Settings },
    ],
  },
];
