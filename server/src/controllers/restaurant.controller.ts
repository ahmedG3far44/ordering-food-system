import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurant.service';

const restaurantService = new RestaurantService();

export const createRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { name, address, cuisine, imageUrl, description, currency } = req.body;
    const restaurant = await restaurantService.createRestaurant(userId, { name, address, cuisine, imageUrl, description, currency });
    res.status(201).json(restaurant);
  } catch (error) {
    next(error);
  }
};

export const getMyRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const restaurants = await restaurantService.getRestaurantsByOwner(userId);
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantById(id as string);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, address, cuisine, imageUrl, description, currency } = req.body;
    const data = { name, address, cuisine, imageUrl, description, currency };
    Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);
    const restaurant = await restaurantService.updateRestaurant(id as string, userId, data);
    res.json(restaurant);
  } catch (error: any) {
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const deleteRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    await restaurantService.deleteRestaurant(id as string, userId);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const getAllRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurants = await restaurantService.getAllRestaurants();
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
};

export const getRestaurantMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const menu = await restaurantService.getRestaurantMenu(id as string);
    res.json(menu);
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const menuItemData = req.body;
    const menuItem = await restaurantService.createMenuItem(id as string, userId, menuItemData);
    res.status(201).json(menuItem);
  } catch (error: any) {
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id, menuItemId } = req.params;
    const data = req.body;
    const menuItem = await restaurantService.updateMenuItem(id as string, menuItemId as string, userId, data);
    res.json(menuItem);
  } catch (error: any) {
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id, menuItemId } = req.params;
    await restaurantService.deleteMenuItem(id as string, menuItemId as string, userId);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const getRestaurantSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
    }
    if (endDate) {
      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    }

    const sales = await restaurantService.getSalesByRestaurant(id as string, userId, start, end);
    res.json(sales);
  } catch (error: any) {
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const getMySales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
    }
    if (endDate) {
      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    }

    const sales = await restaurantService.getAllSalesByOwner(userId, start, end);
    res.json(sales);
  } catch (error) {
    next(error);
  }
};