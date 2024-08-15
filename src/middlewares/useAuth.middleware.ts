import { createReferral, getReferralsCount } from '../api/users/referral.model';
import { UsersController } from '../api/users/users.controller';
import { getUser, updateUser } from '../api/users/users.model';
import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from '../helpers/encryptionService';
import { responseWithBadRequest } from '../utils/express';
import { error, debug } from '../utils/logger';
import { calculateRewardForNewFriend } from '../utils/reward';

const logCategory = 'useAuth.middleware';

export const useAuth =
  (options?: { passUnauthorized?: boolean }) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      debug(logCategory, 'No authorization header', {
        headers: req.headers,
      });
      return responseWithBadRequest(res);
    }

    let userResult: ReturnType<typeof UsersController.parseInitData>;
    try {
      userResult = UsersController.parseInitData(authorizationHeader);

      if (!userResult) {
        debug(logCategory, 'No user result on parse data', {
          authorizationHeader,
        });
        return responseWithBadRequest(res);
      }
    } catch (err) {
      debug(logCategory, 'Can not parse user data', {
        authorizationHeader,
      });
      return responseWithBadRequest(res);
    }

    UsersController.getOrCreateUser({
      telegramId: userResult.id,
      username: userResult.username,
    })
      .then(async (user) => {
        req.user = user;

        if (user.isNew) {
          const inviteLinkParam = EncryptionService.encode(
            user.telegramId.toString(),
          );

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
            try {
              const referral = parseInt(
                EncryptionService.decode(req.query.hash),
              );

              try {
                const referralUser = await getUser({
                  telegramId: referral,
                });

                const referralsCount = await getReferralsCount({
                  user: referralUser._id,
                });
                const friendsReward =
                  calculateRewardForNewFriend(referralsCount);

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
                        'friendsEarnings.money': friendsReward.money,
                        'friendsEarnings.lives': friendsReward.lives,
                        'friendsEarnings.count': 1,
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
            } catch (err) {
              error(
                logCategory,
                new Error('Can not decode referral hash'),
                undefined,
                {
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
