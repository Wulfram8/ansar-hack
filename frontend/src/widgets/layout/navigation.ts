import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  UserPlus,
  MessageSquare,
  Megaphone,
  BarChart3,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Маршрут. Если не задан — пункт показывается, но пока не реализован. */
  to?: string;
}

/** Боковое меню по дизайну CRM (Pencil iJVJY), раздел «Основное». */
export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Дашборд", icon: LayoutDashboard },
  { to: "/patients", label: "Пациенты", icon: Users },
  { to: "/appointments", label: "Записи", icon: CalendarCheck },
  { label: "Расписание", icon: CalendarDays },
  { to: "/leads", label: "Лиды", icon: UserPlus },
  { to: "/notifications/templates", label: "Коммуникации", icon: MessageSquare },
  { label: "Маркетинг", icon: Megaphone },
  { label: "Аналитика", icon: BarChart3 },
  { label: "AI Ассистент", icon: Sparkles },
  { label: "Настройки", icon: Settings },
];
