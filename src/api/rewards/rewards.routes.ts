import { Router } from 'express';
import { UserDoc } from '../../types/User';
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

router.post('/referrals/claim', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as UserDoc;

    await RewardsController.claimReferralReward(user);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/new-friends/claim', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as UserDoc;

    await RewardsController.claimNewFriendsReward(user);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:rewardId/claim', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as UserDoc;

    const rewardId = new Types.ObjectId(req.params.rewardId);

    await RewardsController.claimReward(rewardId, user);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
