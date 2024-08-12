import { Router } from 'express';
import { UsersController } from './users.controller';
import { UserDoc } from '../../types/User';
import { useAuth } from '../../middlewares/useAuth.middleware';
import { RewardsController } from '../../api/rewards/rewards.controller';
import { validateData } from '../../utils/route';
import { z } from 'zod';

export const router = Router();

router.get(
  '/me',
  useAuth({
    passUnauthorized: true,
  }),
  async (req, res, next) => {
    try {
      const user = req.user as UserDoc;

      if (user == null) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      await RewardsController.claimDailyReward(user);

      const userView = await UsersController.userToView(user, true);

      res.json(userView);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/play', useAuth(), async (req, res, next) => {
  try {
    const play = await UsersController.getCurrentPlay(req.user as UserDoc);

    res.json(play);
  } catch (err) {
    next(err);
  }
});

router.get('/referrals', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as UserDoc;

    const query = validateData(
      req.query,
      z.object({
        offset: z.number().optional(),
        limit: z.number().max(20).optional(),
      }),
    );
    if ('error' in query) {
      return res.status(400).send(query.error);
    }

    const results = await UsersController.getReferrals(user, query);

    res.json({
      results,
    });
  } catch (err) {
    next(err);
  }
});
