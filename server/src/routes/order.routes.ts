import { Router, Request, Response, NextFunction } from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrdersByRestaurant,
  getOrderById, 
  updateOrderStatus 
} from '../controllers/order.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import {  updateOrderStatusSchema } from '../utils/validation';

const router = Router();

// const validateOrder = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     orderSchema.parse(req.body);
//     next();
//   } catch (error: any) {
//     return res.status(400).json({ error: error.errors });
//   }
// };

const validateOrderStatus = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateOrderStatusSchema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({ error: error.errors });
  }
};

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);
router.get('/restaurant/:id', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), getOrdersByRestaurant);
router.get('/:id', authMiddleware, getOrderById);
router.patch('/:id/status', authMiddleware, roleMiddleware(['RESTAURANT_OWNER']), validateOrderStatus, updateOrderStatus);

export default router;