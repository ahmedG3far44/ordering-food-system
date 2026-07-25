import { Router } from 'express';
import { 
  getAllRestaurants,
  getMyRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getRestaurantSales,
  getMySales,
} from '../controllers/restaurant.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { menuItemSchema, restaurantSchema, uuidSchema } from '../utils/validation';
import { Request, Response, NextFunction } from 'express';

const router = Router();

const validateRestaurant = (req: Request, res: Response, next: NextFunction) => {
  try {
    restaurantSchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({ error: error.errors });
  }
};

const validateMenuItem = (req: Request, res: Response, next: NextFunction) => {
  try {
    menuItemSchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({ error: error.errors });
  }
};

const validateUuid = (req: Request, res: Response, next: NextFunction) => {
  try {
    uuidSchema.parse(req.params.id);
    next();
  } catch (error: any) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
};

router.get('/', getAllRestaurants);

router.get('/my', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), getMyRestaurants);

router.get('/my/sales', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), getMySales);

router.post('/', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), validateRestaurant, createRestaurant);

router.get('/:id', validateUuid, getRestaurantById);

router.put('/:id', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), validateUuid, updateRestaurant);

router.delete('/:id', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), validateUuid, deleteRestaurant);

router.get('/:id/menu', validateUuid, getRestaurantMenu);

router.get('/:id/sales', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), validateUuid, getRestaurantSales);

router.post('/:id/menu', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), validateUuid, validateMenuItem, createMenuItem);

router.put('/:id/menu/:menuItemId', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), validateUuid, updateMenuItem);

router.delete('/:id/menu/:menuItemId', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), validateUuid, deleteMenuItem);

export default router;