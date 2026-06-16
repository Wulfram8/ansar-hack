import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  UserPlus,
  MessageSquare,
  BarChart3,
  Megaphone,
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
  /** Числовой бейдж справа от пункта. */
  badge?: number;
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
      { to: "/appointments", label: "Записи", icon: CalendarCheck, badge: 24 },
      { to: "/schedule", label: "Расписание врачей", icon: CalendarDays },
      { to: "/leads", label: "Лиды", icon: UserPlus, badge: 7 },
      { to: "/notifications/templates", label: "Коммуникации", icon: MessageSquare },
    ],
  },
  {
    title: "Аналитика и маркетинг",
    items: [
      { label: "Аналитика", icon: BarChart3 },
      { label: "Маркетинг", icon: Megaphone },
      { label: "Уведомления", icon: Bell },
      { to: "/assistant", label: "AI Ассистент", icon: Sparkles },
    ],
  },
  {
    title: "Система",
    items: [
      { label: "Сотрудники", icon: UserCog },
      { label: "Настройки", icon: Settings },
    ],
  },
];
