import mongoose from 'mongoose';
import { Order, OrderItem, Restaurant, MenuItem, OrderStatus } from '../models';
import { createError } from '../middlewares/errorHandler';

export class OrderService {
  async createOrder(customerId: string, restaurantId: string, items: { menuItemId: string; quantity: number }[]) {
    try {
      const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
      const customerObjectId = new mongoose.Types.ObjectId(customerId);

      const restaurant = await Restaurant.findById(restaurantObjectId);
      if (!restaurant) {
        throw createError(404, 'Restaurant not found');
      }

      let totalAmount = 0;
      const orderItemsData: any[] = [];

      for (const item of items) {
        const menuItemObjectId = new mongoose.Types.ObjectId(item.menuItemId);
        const menuItem = await MenuItem.findById(menuItemObjectId);

        if (!menuItem) {
          throw createError(404, `Menu item with id ${item.menuItemId} not found`);
        }

        if (menuItem.restaurantId.toString() !== restaurantObjectId.toString()) {
          throw createError(400, `Menu item "${menuItem.name}" does not belong to this restaurant`);
        }

        const itemTotal = Number(menuItem.price) * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          orderId: null,
          menuItemId: menuItemObjectId,
          quantity: item.quantity,
          priceAtPurchase: menuItem.price,
        });
      }

      const order = await Order.create({
        customerId: customerObjectId,
        restaurantId: restaurantObjectId,
        status: 'PENDING' as OrderStatus,
        totalAmount: mongoose.Types.Decimal128.fromString(totalAmount.toString()),
      });

      const orderId = order._id;

      const orderItemsWithOrderId = orderItemsData.map(itemData => ({
        ...itemData,
        orderId: orderId,
      }));

      await OrderItem.insertMany(orderItemsWithOrderId);

      const createdOrder = await Order.findById(orderId)
        .populate({ path: 'items' })
        .populate('restaurant', 'name address');

      return createdOrder;
    } catch (error) {
      console.error('CreateOrder error:', error);
      throw error;
    }
  }

  async getOrders(userId: string, role: string) {
    if (role === 'RESTAURANT_OWNER') {
      const restaurants = await Restaurant.find({ ownerId: new mongoose.Types.ObjectId(userId) });
      if (restaurants.length === 0) return [];
      const restaurantIds = restaurants.map(r => r._id);
      return await Order.find({ restaurantId: { $in: restaurantIds } })
        .sort({ createdAt: -1 })
        .populate({ path: 'items' })
        .populate('restaurant', 'name')
        .populate({ path: 'customer', select: 'name email' });
    }

    return await Order.find({ customerId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate({ path: 'items' })
      .populate('restaurant', 'name');
  }

  async getOrdersByRestaurant(restaurantId: string, ownerId: string) {
    const restaurant = await Restaurant.findOne({
      _id: new mongoose.Types.ObjectId(restaurantId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!restaurant) {
      throw createError(403, 'Restaurant not found or unauthorized');
    }

    return await Order.find({ restaurantId: restaurant._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'items' })
      .populate('restaurant', 'name')
      .populate({ path: 'customer', select: 'name email' });
  }

  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await Order.findById(orderId)
      .populate({ path: 'items' })
      .populate('restaurant');

    if (!order) throw createError(404, 'Order not found');

    if (role === 'CUSTOMER' && order.customerId.toString() !== userId) {
      throw createError(403, 'Unauthorized to view this order');
    }

    if (role === 'RESTAURANT_OWNER') {
      const restaurant = await Restaurant.findOne({
        _id: order.restaurantId,
        ownerId: new mongoose.Types.ObjectId(userId)
      });
      if (!restaurant) throw createError(403, 'Unauthorized to view this order');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, userId: string) {
    const order = await Order.findById(orderId);

    if (!order) throw createError(404, 'Order not found');

    const restaurant = await Restaurant.findOne({
      _id: order.restaurantId,
      ownerId: new mongoose.Types.ObjectId(userId)
    });

    if (!restaurant) throw createError(403, 'Unauthorized to update order status');

    return await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after' });
  }
}