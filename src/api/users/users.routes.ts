import { Router } from 'express';
import { UsersController } from './users.controller';
import { User } from '../../types/User';
import { useAuth } from '../../middlewares/useAuth.middleware';
import { RewardsController } from '../../api/rewards/rewards.controller';

export const router = Router();

router.get(
  '/me',
  useAuth({
    passUnauthorized: true,
  }),
  async (req, res, next) => {
    try {
      const user = req.user as User;

      if (user == null) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      await RewardsController.claimDailyReward(user);

      const userView = await UsersController.userToView(user);

      res.json(userView);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/referrals', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as User;

    const results = await UsersController.getReferrals(user);

    res.json({
      results,
    });
  } catch (err) {
    next(err);
  }
});
