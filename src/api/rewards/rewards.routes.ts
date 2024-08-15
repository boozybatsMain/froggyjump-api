import { Router } from 'express';
import { UserDoc } from '../../types/User';
import { useAuth } from '../../middlewares/useAuth.middleware';
import { Types } from 'mongoose';
import { RewardsController } from './rewards.controller';
import { responseWithUserEarnings } from '../../utils/server';

export const router = Router();

/**
 * @swagger
 * /rewards:
 *   get:
 *     tags:
 *       - Rewards
 *     summary: Returns a list of available rewards
 *     responses:
 *       200:
 *         description: A list of rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RewardDoc'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res, next) => {
  try {
    const results = await RewardsController.getRewards();
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /rewards/daily/claim:
 *   post:
 *     tags:
 *       - Rewards
 *     summary: Claim the daily reward for the user
 *     responses:
 *       200:
 *         description: User's earnings after claiming the daily reward
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserEarningsView'
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post('/daily/claim', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as UserDoc;
    await RewardsController.claimDailyReward(user);
    responseWithUserEarnings(res, user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /rewards/referrals/claim:
 *   post:
 *     tags:
 *       - Rewards
 *     summary: Claim the referral reward for the user
 *     responses:
 *       200:
 *         description: User's earnings after claiming the referral reward
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserEarningsView'
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post('/referrals/claim', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as UserDoc;
    await RewardsController.claimReferralReward(user);
    responseWithUserEarnings(res, user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /rewards/new-friends/claim:
 *   post:
 *     tags:
 *       - Rewards
 *     summary: Claim the reward for new friends for the user
 *     responses:
 *       200:
 *         description: User's earnings after claiming the new friends reward
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserEarningsView'
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post('/new-friends/claim', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as UserDoc;
    await RewardsController.claimNewFriendsReward(user);
    responseWithUserEarnings(res, user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /rewards/{rewardId}/claim:
 *   post:
 *     tags:
 *       - Rewards
 *     summary: Claim a specific reward for the user
 *     parameters:
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reward to claim
 *     responses:
 *       200:
 *         description: User's earnings after claiming the reward
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserEarningsView'
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post('/:rewardId/claim', useAuth(), async (req, res, next) => {
  try {
    const user = req.user as UserDoc;
    const rewardId = new Types.ObjectId(req.params.rewardId);
    await RewardsController.claimReward(rewardId, user);
    responseWithUserEarnings(res, user);
  } catch (err) {
    next(err);
  }
});
