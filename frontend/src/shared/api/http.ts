import axios from "axios";
import { API_URL, API_PREFIX, STORAGE_KEYS } from "@/shared/config";

/**
 * Единый axios-инстанс для всех запросов к бэкенду.
 * Подставляет Token-заголовок (DRF TokenAuthentication) и обрабатывает 401.
 */
export const http = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
    }
    return Promise.reject(error);
  },
);
