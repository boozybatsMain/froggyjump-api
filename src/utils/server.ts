import { Response, Request } from 'express';
import * as core from 'express-serve-static-core';
import z from 'zod';
import { UserDoc } from '../types/User';
import { UsersController } from '../api/users/users.controller';

export const buildCommonRoute = (route: string) => (secondaryRoute: string) => {
  return `/${route}/${secondaryRoute}`;
};

export const validateData = <T>(
  body: Request<core.ParamsDictionary, unknown, Partial<T>>['body'],
  expected: z.ZodSchema<T>,
):
  | T
  | {
      error: string;
    } => {
  const result = expected.safeParse(body);

  if (result.success) {
    return result.data;
  }

  return {
    error: result.error.message,
  };
};

export const responseWithUserEarnings = (
  res: Response,
  user: UserDoc,
  otherData?: Record<string, unknown>,
): void => {
  res.status(200).json({
    ...otherData,
    ...UsersController.earningsToView(user),
  });
};
