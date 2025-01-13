import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { LogsRequest } from './types';


export function validateRequest(req: Request<LogsRequest>, res: Response, next: NextFunction) {
  try {
    // Attach the validated and parsed params to the body
    req.body = LogsRequest.parse({ ...req.query, path: req.params.path });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        message: 'Invalid query parameters',
        errors: err.errors,
      });
    } else {
      next(err);
    }
  }
}
