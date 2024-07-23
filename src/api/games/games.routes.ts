import { Router } from 'express';
import { GamesController } from './games.controller';
import { validateData } from 'utils/route';
import { z } from 'zod';
import { Types } from 'mongoose';

export const router = Router();

router.get('/', async (req, res) => {
  const games = await GamesController.getGames();

  res.json({
    results: games,
  });
});

router.get('/leaderboard', async (req, res) => {
  const data = validateData(
    req.query,
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

  const results = await GamesController.getLeaderboard(gameId);

  res.json({
    results,
  });
});
