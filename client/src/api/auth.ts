import api from './axios';
import type { AuthResponse } from '../types';

export const authService = {
  async register(data: { email: string; password: string; name: string; role?: string }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};
