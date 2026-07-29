import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';

export interface ApiError extends Error {
  statusCode: number;
  status: string;
}

const MULTER_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: 'Image size exceeds the 4MB limit. Please upload a smaller image.',
  LIMIT_FILE_COUNT: 'Too many files uploaded. Please upload a single image.',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Please use the correct upload field.',
};

export const createError = (statusCode: number, message: string): ApiError => {
  return {
    statusCode,
    status: 'error',
    message,
  } as ApiError;
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: fieldErrors,
    });
  }

  if (err instanceof multer.MulterError) {
    const message = MULTER_MESSAGES[err.code] || err.message;
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: 'error',
      statusCode: 409,
      message: `${field} already exists`,
      errors: { [field]: `This ${field} is already registered` },
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};
