import { apiClient, extractData } from './client';
import type { Contact, Lead, Opportunity, Task, PaginatedResponse } from '@/types';

// Generic CRUD API factory
function createCrudApi<T>(basePath: string) {
  return {
    list: async (params?: Record<string, any>) => {
      const res = await apiClient.get<{ data: PaginatedResponse<T> }>(basePath, { params });
      return extractData(res);
    },

    get: async (id: string) => {
      const res = await apiClient.get<{ data: T }>(`${basePath}/${id}`);
      return extractData(res);
    },

    create: async (data: Partial<T>) => {
      const res = await apiClient.post<{ data: T }>(basePath, data);
      return extractData(res);
    },

    update: async (id: string, data: Partial<T>) => {
      const res = await apiClient.patch<{ data: T }>(`${basePath}/${id}`, data);
      return extractData(res);
    },

    remove: async (id: string) => {
      await apiClient.delete(`${basePath}/${id}`);
    },
  };
}

export const contactsApi = createCrudApi<Contact>('/contacts');
export const leadsApi = createCrudApi<Lead>('/leads');
export const opportunitiesApi = createCrudApi<Opportunity>('/opportunities');
export const tasksApi = createCrudApi<Task>('/tasks');
