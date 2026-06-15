/**
 * Глобальные константы приложения.
 * API_URL берётся из переменной окружения; если пусто — используется
 * относительный путь (dev-proxy на Django, см. vite.config.ts).
 */
export const API_URL = import.meta.env.VITE_API_URL ?? "";

/** Базовый префикс REST API бэкенда (Django DRF). */
export const API_PREFIX = "/api";

/** Эндпоинт получения токена (DRF obtain_auth_token). */
export const AUTH_TOKEN_ENDPOINT = `${API_PREFIX}/auth-token/`;

/** Ключи в localStorage. */
export const STORAGE_KEYS = {
  token: "crm.token",
  user: "crm.user",
} as const;

export const DEFAULT_PAGE_SIZE = 10;
