import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler, headers, notFoundHandler } from './middleware';
import logsApi from './api/logs/routes';

require('dotenv').config();

const app = express();
app.use(morgan('dev'));
app.use(helmet({
  xFrameOptions: { action: 'deny' },
}));
app.use(cors());
app.use(express.json());
app.use(headers);


app.use('/status', (req, res) => {
  res.status(200).json({ message:'OK' });
});

app.get('/', (req, res) => {
  res.redirect('/status');
});

app.use('/logs', logsApi);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
