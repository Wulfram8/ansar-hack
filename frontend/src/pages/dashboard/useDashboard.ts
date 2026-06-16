import { useCustom, useApiUrl } from "@refinedev/core";
import type { Dashboard } from "@/entities/dashboard";

/** Загружает сводку дашборда из GET /api/analytics/dashboard/. */
export function useDashboard() {
  const apiUrl = useApiUrl();
  return useCustom<Dashboard>({
    url: `${apiUrl}/analytics/dashboard/`,
    method: "get",
  });
}
