import express, { Application, Request, Response, NextFunction } from 'express';
import routes from './api';
import { error } from './utils/logger';

const logCategory = 'app.ts';

export const app: Application = express();

app.use(express.json());
app.use('/api', routes);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  error(logCategory, err, 'Uncaught exception');
  res.status(500).json({
    ok: false,
  });
});
