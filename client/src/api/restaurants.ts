import api from './axios';
import type { Restaurant, MenuItem, CreateRestaurantInput, UpdateRestaurantInput, CreateMenuItemInput, UpdateMenuItemInput, SalesData, DateRange } from '../types';

export const restaurantService = {
  async getAll() {
    const response = await api.get<Restaurant[]>('/restaurants');
    return response.data;
  },

  async getMy() {
    const response = await api.get<Restaurant[]>('/restaurants/my');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  async create(data: CreateRestaurantInput) {
    const response = await api.post<Restaurant>('/restaurants', data);
    return response.data;
  },

  async update(id: string, data: UpdateRestaurantInput) {
    const response = await api.put<Restaurant>(`/restaurants/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/restaurants/${id}`);
  },

  async getMenu(id: string) {
    const response = await api.get<MenuItem[]>(`/restaurants/${id}/menu`);
    return response.data;
  },

  async addMenuItem(id: string, item: CreateMenuItemInput) {
    const response = await api.post<MenuItem>(`/restaurants/${id}/menu`, item);
    return response.data;
  },

  async updateMenuItem(restaurantId: string, menuItemId: string, item: UpdateMenuItemInput) {
    const response = await api.put<MenuItem>(`/restaurants/${restaurantId}/menu/${menuItemId}`, item);
    return response.data;
  },

  async deleteMenuItem(restaurantId: string, menuItemId: string) {
    await api.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`);
  },

  async getSales(restaurantId: string, dateRange?: DateRange) {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<SalesData>(`/restaurants/${restaurantId}/sales${query}`);
    return response.data;
  },

  async getMySales(dateRange?: DateRange) {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<SalesData>(`/restaurants/my/sales${query}`);
    return response.data;
  },
};
