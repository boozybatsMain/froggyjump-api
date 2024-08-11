import { Response } from 'express';

export const responseWithBadRequest = (res: Response) =>
  res.status(400).send('Bad Request');
