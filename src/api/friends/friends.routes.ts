import { Router } from 'express';
import { User } from 'types/User';
import { useAuth } from 'middlewares/useAuth.middleware';
import { UsersController } from 'api/users/users.controller';
import { FriendsController } from './friends.controller';
import { validateData } from 'utils/route';
import { z } from 'zod';

export const router = Router();

router.get('/', useAuth(), async (req, res) => {
  const user = req.user as User;

  const data = validateData(
    req.query,
    z.object({
      offset: z.number().min(0),
      count: z.number().min(0).max(100),
    }),
  );
  if ('error' in data) {
    return res.status(400).send(data.error);
  }

  const userFriendsResult = await FriendsController.getUserFriends(
    user.telegramId,
    data.offset,
    data.count,
  );

  const users = userFriendsResult.users.map((user) =>
    UsersController.userToView(user),
  );

  res.json({
    results: users,
    meta: {
      total: userFriendsResult.total,
      offset: data.offset,
      count: data.count,
    },
  });
});

router.get('/invite', useAuth(), async (req, res) => {
  // @TODO form url that points on bot with start param containing referrer id

  res.json({
    url: '',
  });
});
