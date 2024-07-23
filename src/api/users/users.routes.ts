import { Router } from 'express';
import { UsersController } from './users.controller';
import { User } from 'types/User';
import { useAuth } from 'middlewares/useAuth.middleware';
import { validateData } from 'utils/route';
import { z } from 'zod';
import { Types } from 'mongoose';

export const router = Router();

router.get(
  '/me',
  useAuth({
    passUnauthorized: true,
  }),
  async (req, res) => {
    const user = req.user as User | undefined;

    if (user == null) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json(UsersController.userToView(user));
  },
);

router.post('/rewards/claim', useAuth(), (req, res) => {
  UsersController.claimReward((req.user as User).telegramId, req.body.rewardId);

  res.json({
    ok: true,
  });
});

router.post('/games/play', useAuth(), async (req, res) => {
  const user = req.user as User;

  const data = validateData(
    req.body,
    z.object({
      gameId: z.string(),
    }),
  );
  if ('error' in data) {
    return res.status(400).send(data.error);
  }

  let gameId: Types.ObjectId;
  try {
    gameId = new Types.ObjectId(data.gameId);
  } catch (e) {
    return res.status(400).send('Invalid game id');
  }

  const playId = await UsersController.playGame(user.telegramId, gameId);

  res.json({
    playId,
  });
});

router.post('/games/claim', useAuth(), async (req, res) => {
  const user = req.user as User;

  const data = validateData(
    req.body,
    z.object({
      playId: z.string(),
      amount: z.number(),
    }),
  );
  if ('error' in data) {
    return res.status(400).send(data.error);
  }

  const playId = await UsersController.claimGame(
    user.telegramId,
    data.playId,
    data.amount,
  );

  res.json({
    ok: true,
  });
});
