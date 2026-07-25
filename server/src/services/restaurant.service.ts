import mongoose from 'mongoose';
import { Restaurant, MenuItem, Order, OrderItem, IMenuItem, Currency } from '../models';
import { createError } from '../middlewares/errorHandler';

export interface CreateRestaurantData {
  name: string;
  address: string;
  currency?: Currency;
  imageUrl?: string;
  cuisine?: string;
  description?: string;
}

export interface UpdateRestaurantData {
  name?: string;
  address?: string;
  currency?: Currency;
  imageUrl?: string;
  cuisine?: string;
  description?: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
}

export interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  dateRange: { start: Date; end: Date };
  breakdown: {
    menuItemId: string;
    menuItemName: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export class RestaurantService {
  async createRestaurant(ownerId: string, data: CreateRestaurantData) {
    return await Restaurant.create({
      name: data.name,
      address: data.address,
      currency: data.currency || 'USD',
      imageUrl: data.imageUrl,
      cuisine: data.cuisine,
      description: data.description,
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
  }

  async getAllRestaurants() {
    return await Restaurant.find().populate('ownerId', 'name email');
  }

  async getRestaurantsByOwner(ownerId: string) {
    return await Restaurant.find({ ownerId: new mongoose.Types.ObjectId(ownerId) });
  }

  async getRestaurantById(restaurantId: string) {
    return await Restaurant.findById(restaurantId).populate('ownerId', 'name email');
  }

  async updateRestaurant(restaurantId: string, ownerId: string, data: UpdateRestaurantData) {
    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(restaurantId), ownerId: new mongoose.Types.ObjectId(ownerId) },
      data,
      { returnDocument: 'after' }
    );
    if (!restaurant) {
      throw createError(403, 'Restaurant not found or unauthorized');
    }
    return restaurant;
  }

  async deleteRestaurant(restaurantId: string, ownerId: string) {
    const restaurant = await Restaurant.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(restaurantId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!restaurant) {
      throw createError(403, 'Restaurant not found or unauthorized');
    }
    await MenuItem.deleteMany({ restaurantId: new mongoose.Types.ObjectId(restaurantId) });
    return restaurant;
  }

  async getRestaurantMenu(restaurantId: string) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw createError(404, 'Restaurant not found');
    }
    return await MenuItem.find({ restaurantId: new mongoose.Types.ObjectId(restaurantId) });
  }

  async createMenuItem(restaurantId: string, ownerId: string, menuItemData: CreateMenuItemData) {
    const restaurant = await Restaurant.findOne({
      _id: new mongoose.Types.ObjectId(restaurantId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!restaurant) {
      throw createError(403, 'Restaurant not found or unauthorized');
    }

    return await MenuItem.create({
      name: menuItemData.name,
      description: menuItemData.description,
      imageUrl: menuItemData.imageUrl,
      price: mongoose.Types.Decimal128.fromString(menuItemData.price.toString()),
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    });
  }

  async updateMenuItem(restaurantId: string, menuItemId: string, ownerId: string, data: UpdateMenuItemData) {
    const restaurant = await Restaurant.findOne({
      _id: new mongoose.Types.ObjectId(restaurantId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!restaurant) {
      throw new Error('Restaurant not found or unauthorized');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.price) updateData.price = mongoose.Types.Decimal128.fromString(data.price.toString());

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(menuItemId), restaurantId: new mongoose.Types.ObjectId(restaurantId) },
      updateData,
      { returnDocument: 'after' }
    );
    if (!menuItem) {
      throw createError(404, 'Menu item not found');
    }
    return menuItem;
  }

  async deleteMenuItem(restaurantId: string, menuItemId: string, ownerId: string) {
    const restaurant = await Restaurant.findOne({
      _id: new mongoose.Types.ObjectId(restaurantId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!restaurant) {
      throw new Error('Restaurant not found or unauthorized');
    }

    const menuItem = await MenuItem.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(menuItemId),
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    });
    if (!menuItem) {
      throw createError(404, 'Menu item not found');
    }
    return menuItem;
  }

  async getSalesByRestaurant(restaurantId: string, ownerId: string, startDate?: Date, endDate?: Date) {
    const restaurant = await Restaurant.findOne({
      _id: new mongoose.Types.ObjectId(restaurantId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!restaurant) {
      throw createError(403, 'Restaurant not found or unauthorized');
    }

    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start = startDate || defaultStart;
    const end = endDate || now;

    const orders = await Order.find({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['PENDING', 'PREPARING', 'DELIVERED'] },
    });

    let totalRevenue = 0;
    for (const order of orders) {
      totalRevenue += Number(order.totalAmount);
    }

    const orderIds = orders.map(o => o._id);
    const orderItems = await OrderItem.find({ orderId: { $in: orderIds } }).populate('menuItemId', 'name');

    const breakdownMap = new Map<string, { menuItemName: string; quantitySold: number; revenue: number }>();

    for (const item of orderItems) {
      const menuItemId = item.menuItemId._id.toString();
      const menuItemName = (item.menuItemId as any).name;
      const itemRevenue = Number(item.priceAtPurchase) * item.quantity;

      if (breakdownMap.has(menuItemId)) {
        const existing = breakdownMap.get(menuItemId)!;
        existing.quantitySold += item.quantity;
        existing.revenue += itemRevenue;
      } else {
        breakdownMap.set(menuItemId, { menuItemName, quantitySold: item.quantity, revenue: itemRevenue });
      }
    }

    const items = Array.from(breakdownMap.entries()).map(([menuItemId, data]) => ({
      menuItemId,
      name: data.menuItemName,
      quantitySold: data.quantitySold,
      revenue: data.revenue,
    }));

    return {
      totalRevenue,
      totalOrders: orders.length,
      dateRange: { start, end },
      items,
    };
  }

  async getAllSalesByOwner(ownerId: string, startDate?: Date, endDate?: Date) {
    const restaurants = await Restaurant.find({ ownerId: new mongoose.Types.ObjectId(ownerId) });
    const restaurantIds = restaurants.map(r => r._id);

    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start = startDate || defaultStart;
    const end = endDate || now;

    const orders = await Order.find({
      restaurantId: { $in: restaurantIds },
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['PENDING', 'PREPARING', 'DELIVERED'] },
    });

    let totalRevenue = 0;
    for (const order of orders) {
      totalRevenue += Number(order.totalAmount);
    }

    const orderIds = orders.map(o => o._id);
    const orderItems = await OrderItem.find({ orderId: { $in: orderIds } }).populate('menuItemId', 'name');

    const breakdownMap = new Map<string, { menuItemName: string; quantitySold: number; revenue: number }>();

    for (const item of orderItems) {
      const menuItemId = item.menuItemId._id.toString();
      const menuItemName = (item.menuItemId as any).name;
      const itemRevenue = Number(item.priceAtPurchase) * item.quantity;

      if (breakdownMap.has(menuItemId)) {
        const existing = breakdownMap.get(menuItemId)!;
        existing.quantitySold += item.quantity;
        existing.revenue += itemRevenue;
      } else {
        breakdownMap.set(menuItemId, { menuItemName, quantitySold: item.quantity, revenue: itemRevenue });
      }
    }

    const items = Array.from(breakdownMap.entries()).map(([menuItemId, data]) => ({
      menuItemId,
      name: data.menuItemName,
      quantitySold: data.quantitySold,
      revenue: data.revenue,
    }));

    const restaurantSales = await Promise.all(
      restaurants.map(async (restaurant) => {
        const restOrders = orders.filter(o => o.restaurantId.toString() === restaurant._id.toString());
        let restRevenue = 0;
        for (const order of restOrders) {
          restRevenue += Number(order.totalAmount);
        }
        return {
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          totalOrders: restOrders.length,
          totalRevenue: restRevenue,
        };
      })
    );

    return {
      totalRevenue,
      totalOrders: orders.length,
      dateRange: { start, end },
      items,
      restaurantSales,
    };
  }
}