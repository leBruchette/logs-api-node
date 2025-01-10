import { NextFunction, Request, Response } from 'express';

export  interface MessageResponse {
  message: string;
}

export interface ErrorResponse extends MessageResponse {
  stack?: string;
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  next(new Error('Not Found'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: err.stack,
  });
}

export function headers(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
}
