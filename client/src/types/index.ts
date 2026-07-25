export type UserRole = 'CUSTOMER' | 'RESTAURANT_OWNER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Restaurant {
  id: string;
  _id?: string;
  name: string;
  address: string;
  ownerId: string;
  // Extended properties for UI
  cuisine?: string;
  imageUrl?: string;
  rating?: number;
  deliveryTime?: string;
  description?: string;
  currency?: string;
}

export interface MenuItem {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  restaurantId: string;
  // Extended properties for UI
  category?: string;
  imageUrl?: string;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id?: string;
  orderId?: string;
  menuItemId: string;
  quantity: number;
  priceAtPurchase?: number;
  // Extended for UI
  name?: string;
  price?: number;
}

export interface Order {
  id: string;
  _id?: string;
  customerId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  // Extended for UI
  restaurant?: {
    id: string;
    name: string;
    address: string;
  };
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  customerName?: string;
  customerEmail?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CartItem extends OrderItem {
  restaurantId: string;
  currency?: string;
  imageUrl?: string;
}

export interface CreateRestaurantInput {
  name: string;
  address: string;
  cuisine?: string;
  imageUrl?: string;
  description?: string;
  currency?: string;
}

export interface UpdateRestaurantInput extends Partial<CreateRestaurantInput> {}

export interface CreateMenuItemInput {
  name: string;
  description: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {}

export interface SalesItem {
  menuItemId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesData {
  totalOrders: number;
  totalRevenue: number;
  items: SalesItem[];
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}
