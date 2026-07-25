import * as authService from '../services/auth.service';

import { NextFunction, Request, Response } from 'express';
import { loginSchema, registerSchema } from '../utils/validation';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const validatedData = registerSchema.parse(req.body);

    const user = await authService.registerUser(validatedData as any);

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
