import { UsersController } from 'api/users/users.controller';
import { Request, Response, NextFunction } from 'express';
import { User } from 'types/User';

const responseWithBadRequest = (res: Response) =>
  res.status(400).send('Bad Request');

export const useAuth =
  (options?: { passUnauthorized?: boolean }) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return responseWithBadRequest(res);
    }

    let userResult: Partial<User>;
    try {
      userResult = UsersController.parseInitData(authorizationHeader);
    } catch (err) {
      return responseWithBadRequest(res);
    }

    UsersController.getOrCreateUser(userResult)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        if (options?.passUnauthorized === true) {
          next();
        } else {
          return res.status(401).send('Unauthorized');
        }
      });
  };
