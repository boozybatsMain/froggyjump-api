import { Router } from 'express';
import { UsersController } from './users.controller';
import { UserDoc } from '../../types/User';
import { useAuth } from '../../middlewares/useAuth.middleware';
import { validateData } from '../../utils/server';
import { z } from 'zod';

export const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Returns the current user's profile
 *     responses:
 *       200:
 *         description: The current user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserView'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/me',
  useAuth({
    passUnauthorized: true,
  }),
  async (req, res, next) => {
    try {
      const user = req.user as UserDoc;

      if (user == null) {
        return res.status(404).json({ message: 'User not found' });
      }

      await UsersController.updateUserLastVisit(user);

      const userView = await UsersController.userToView(user, true);
      res.json(userView);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /users/play:
 *   get:
 *     tags:
 *       - Users
 *     summary: Returns the current play session for the user
 *     responses:
 *       200:
 *         description: The current play session for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayDoc'
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/play', useAuth(), async (req, res, next) => {
  try {
    const play = await UsersController.getCurrentPlay(req.user as UserDoc);
    res.json(play);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /users/referrals:
 *   get:
 *     tags:
 *       - Users
 *     summary: Returns the user's referral list
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           description: The number of items to skip before starting to collect the result set
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           description: The maximum number of items to return (maximum 20)
 *         required: false
 *     responses:
 *       200:
 *         description: The user's referral list with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralsPagination'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
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
    res.json({ results });
  } catch (err) {
    next(err);
  }
});
