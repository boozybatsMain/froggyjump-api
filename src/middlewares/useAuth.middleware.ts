import { createReferral } from '../api/users/referral.model';
import { UsersController } from '../api/users/users.controller';
import { getUser, updateUser } from '../api/users/users.model';
import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from '../helpers/encryptionService';
import { responseWithBadRequest } from '../utils/express';
import { error } from '../utils/logger';

const logCategory = 'useAuth.middleware';

export const useAuth =
  (options?: { passUnauthorized?: boolean }) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return responseWithBadRequest(res);
    }

    let userResult: ReturnType<typeof UsersController.parseInitData>;
    try {
      userResult = UsersController.parseInitData(authorizationHeader);

      if (!userResult) {
        return responseWithBadRequest(res);
      }
    } catch (err) {
      return responseWithBadRequest(res);
    }

    UsersController.getOrCreateUser({
      telegramId: userResult.id,
      username: userResult.username,
    })
      .then(async (user) => {
        req.user = user;

        if (user.isNew) {
          const inviteLinkParam = EncryptionService.encode(user.telegramId);

          user.inviteLinkParam = inviteLinkParam;
          const promises: Promise<void>[] = [
            updateUser(
              {
                telegramId: user.telegramId,
              },
              {
                inviteLinkParam: inviteLinkParam,
              },
            ),
          ];

          if (typeof req.query.hash === 'string') {
            const referral = EncryptionService.decode(req.query.hash);

            try {
              const referralUser = await getUser({ telegramId: referral });

              promises.push(
                createReferral({
                  user: referralUser._id,
                  joined: user._id,
                }).then(() => {}),
                updateUser(
                  {
                    telegramId: referralUser.telegramId,
                  },
                  {
                    $inc: {
                      referrals: 1,
                    },
                  },
                ),
              );
            } catch (err) {
              error(
                logCategory,
                new Error('Can not update referral by hash'),
                undefined,
                {
                  referral,
                  hash: req.query.hash,
                },
              );
            }
          }

          await Promise.all(promises);
        }

        next();
      })
      .catch(() => {
        if (options?.passUnauthorized === true) {
          next();
        } else {
          return res.status(401).send('Unauthorized');
        }
      });
  };
