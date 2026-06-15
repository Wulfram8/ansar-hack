import { apiClient, extractData } from './client';
import type { DashboardWidget } from '@/types';

export const dashboardApi = {
  getWidgets: async () => {
    const res = await apiClient.get<{ data: DashboardWidget[] }>('/dashboard/widgets');
    return extractData(res);
  },

  createWidget: async (data: Partial<DashboardWidget>) => {
    const res = await apiClient.post<{ data: DashboardWidget }>('/dashboard/widgets', data);
    return extractData(res);
  },

  updateWidget: async (id: string, data: Partial<DashboardWidget>) => {
    const res = await apiClient.patch<{ data: DashboardWidget }>(`/dashboard/widgets/${id}`, data);
    return extractData(res);
  },

  removeWidget: async (id: string) => {
    await apiClient.delete(`/dashboard/widgets/${id}`);
  },

  getWidgetData: async (widgetId: string) => {
    const res = await apiClient.get<{ data: any }>(`/dashboard/data/${widgetId}`);
    return extractData(res);
  },
};
