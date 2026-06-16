import type { ResourceProps } from "@refinedev/core";

/**
 * Ресурсы refine. Имя ресурса = путь REST API бэкенда (DRF),
 * routes — клиентские маршруты страниц.
 */
export const resources: ResourceProps[] = [
  {
    name: "dashboard",
    list: "/",
    meta: { label: "Дашборд" },
  },
  {
    name: "patients",
    list: "/patients",
    create: "/patients/create",
    edit: "/patients/edit/:id",
    show: "/patients/show/:id",
    meta: { label: "Пациенты", canDelete: true },
  },
  {
    name: "appointments",
    list: "/appointments",
    meta: { label: "Записи" },
  },
  {
    name: "leads",
    list: "/leads",
    meta: { label: "Лиды" },
  },
  {
    name: "schedule",
    list: "/schedule",
    meta: { label: "Расписание врачей" },
  },
  {
    name: "patient-sources",
    list: "/patient-sources",
    meta: { label: "Источники" },
  },
  {
    name: "patient-tags",
    list: "/patient-tags",
    meta: { label: "Теги" },
  },
  {
    name: "assistant",
    list: "/assistant",
    meta: { label: "AI Ассистент" },
  },
  {
    name: "notification_templates",
    list: "/notifications/templates",
    meta: { label: "Уведомления" },
  },
  {
    name: "employees",
    list: "/employees",
    meta: { label: "Сотрудники" },
  },
  {
    name: "settings",
    list: "/settings",
    meta: { label: "Настройки" },
  },
  {
    name: "notifications-log",
    list: "/notifications",
    meta: { label: "Уведомления" },
  },
];
