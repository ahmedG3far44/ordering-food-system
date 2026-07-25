import api from './axios';
import type { Order, OrderStatus, OrderItem } from '../types';

export const orderService = {
  async create(data: { restaurantId: string; items: OrderItem[] }) {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async getOrderDetails(id: string) {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: OrderStatus) {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  async getRestaurantOrders(restaurantId: string) {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}`);
    return response.data;
  },
};
