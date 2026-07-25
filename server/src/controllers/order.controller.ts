import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const orderService = new OrderService();

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId, items } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required and must not be empty' });
    }

    for (const item of items) {
      if (!item.menuItemId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each item must have menuItemId and quantity >= 1' });
      }
    }

    const userId = req.user!.userId;
    const order = await orderService.createOrder(userId, restaurantId, items);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const orders = await orderService.getOrders(userId, role);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrdersByRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const orders = await orderService.getOrdersByRestaurant(id, userId);
    res.json(orders);
  } catch (error: any) {
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;
    const order = await orderService.getOrderById(id as string, userId, role);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.userId;

    const order = await orderService.updateOrderStatus(id as string, status, userId);
    res.json(order);
  } catch (error: any) {
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};