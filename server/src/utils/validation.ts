import { z } from 'zod';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z.string().regex(objectIdPattern, 'Invalid ID format');

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['CUSTOMER', 'RESTAURANT_OWNER']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'JPY', 'CAD', 'AUD', 'INR']);

export const restaurantSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  currency: currencySchema.optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  cuisine: z.string().optional(),
  description: z.string().optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  currency: currencySchema.optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  cuisine: z.string().optional(),
  description: z.string().optional(),
});

export const menuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive(),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
});

export const generateImageSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const orderSchema = z.object({
  restaurantId: z.string(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'DELIVERED', 'CANCELLED']),
});

export const uuidSchema = z.string();