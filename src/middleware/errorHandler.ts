import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError, JoiError, JwtError } from '../utils/app.error';

export const errorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return appErrorHandler(res, error);
  } else if (error instanceof JwtError) {
    return jwtErrorHandler(res, error);
  } else if (error instanceof JoiError) {
    return joiErrorHandler(res, error);
  }

  res.status(500).json({
    success: false,
    status: 500,
    errMsg: 'Internal Server Error...',
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    message: error.message || 'Something went wrong',
  });
  return;
};

const appErrorHandler = (res: Response, error: AppError): void => {
  res.status(error.statusCode).json({
    message: error.message,
    success: false,
    status: error.statusCode,
  });
};

const jwtErrorHandler = (res: Response, error: JwtError): void => {
  const statusCode = error.statusCode || 401;

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message:
      error.message === 'jwt expired'
        ? 'Login has expired. Please login again.'
        : error.message,
    name: error.name,
  });
};

const joiErrorHandler = (res: Response, error: JoiError): void => {
  const statusCode = error.statusCode || 400;

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: error.message,
    type: error.type,
  });
};
