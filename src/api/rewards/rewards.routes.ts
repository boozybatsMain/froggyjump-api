import { Router } from 'express';
import { User } from '../../types/User';
import { useAuth } from '../../middlewares/useAuth.middleware';
import { Types } from 'mongoose';
import { RewardsController } from './rewards.controller';

export const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const results = await RewardsController.getRewards();

    res.json({
      results,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/claim/:rewardId', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as User;

    const rewardId = new Types.ObjectId(req.params.rewardId);

    await RewardsController.claimReward(rewardId, user);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
