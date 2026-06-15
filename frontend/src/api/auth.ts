import { apiClient, extractData } from './client';
import type { AuthResponse, User } from '@/types';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', { email, password });
    return extractData(res);
  },

  register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/register', data);
    return extractData(res);
  },

  getProfile: async () => {
    const res = await apiClient.get<{ data: User }>('/auth/me');
    return extractData(res);
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
