import type { AuthProvider } from "@refinedev/core";
import axios from "axios";
import { http } from "./http";
import { API_URL, AUTH_TOKEN_ENDPOINT, STORAGE_KEYS } from "@/shared/config";

/**
 * AuthProvider под DRF TokenAuthentication.
 * Логин: POST /api/auth-token/ {username, password} → {token}.
 * Профиль: GET /api/users/me/ (если эндпоинт доступен) либо локальные данные.
 */
export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}${AUTH_TOKEN_ENDPOINT}`,
        { username, password },
      );
      localStorage.setItem(STORAGE_KEYS.token, data.token);
      localStorage.setItem(
        STORAGE_KEYS.user,
        JSON.stringify({ username }),
      );
      return { success: true, redirectTo: "/" };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "Ошибка входа",
          message: "Неверный логин или пароль",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    if (token) return { authenticated: true };
    return {
      authenticated: false,
      redirectTo: "/login",
      logout: true,
    };
  },

  onError: async (error) => {
    if (error?.response?.status === 401) {
      return { logout: true, redirectTo: "/login", error };
    }
    return {};
  },

  getIdentity: async () => {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      // Пытаемся обогатить профиль данными с бэкенда.
      const { data } = await http.get("/users/me/");
      return { ...JSON.parse(raw), ...data };
    } catch {
      return JSON.parse(raw);
    }
  },

  getPermissions: async () => {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.role?.code ?? null;
  },
};
