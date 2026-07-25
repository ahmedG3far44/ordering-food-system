import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode: number;
  status: string;
}

export const createError = (statusCode: number, message: string): ApiError => {
  return {
    statusCode,
    status: 'error',
    message,
  } as ApiError;
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};
