import express, { Response } from 'express';
import { FileOpenError, LogsRequest } from './types';
import { MessageResponse } from '../../middleware';
import LogStreamingService from './service';
import * as validators from './validators';

const router = express.Router();
const service = new LogStreamingService();

router.get<Request, MessageResponse>('/', (req, res) => {
  res.status(200).json({ message: 'OK' });
});


router.get<LogsRequest, Response>('/:path(*)', validators.validateRequest, async (req, res, next) => {
  try {
    await service.setResponseWriter(res.write.bind(res)).readLines(req.body);
    next();
  } catch (error) {

    if (error instanceof FileOpenError) {
      res.status(404);
    }
    res.status(500);
    next(error);
  }
});

router.use((req, res) => {
  res.end();
});

export default router;
