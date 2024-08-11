import { Router } from 'express';
import { GamesController } from './games.controller';
import { validateData } from '../../utils/route';
import { z } from 'zod';
import { Types } from 'mongoose';
import { useAuth } from '../../middlewares/useAuth.middleware';
import { User } from '../../types/User';

export const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const games = await GamesController.getGames();

    res.json({
      results: games,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:gameId/play', useAuth(), async (req, res, next) => {
  try {
    const query = validateData(
      req.query,
      z.object({
        gameId: z.string(),
      }),
    );
    if ('error' in query) {
      return res.status(400).send(query.error);
    }

    const user = req.user as User;

    try {
      const gameId = new Types.ObjectId(query.gameId);

      await GamesController.playGame(gameId, user._id as Types.ObjectId);
    } catch (err) {
      return res.status(400).send((err as Error).message);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:playId/claim', useAuth(), async (req, res, next) => {
  try {
    const query = validateData(
      req.query,
      z.object({
        playId: z.string(),
      }),
    );
    if ('error' in query) {
      return res.status(400).send(query.error);
    }

    const data = validateData(
      req.query,
      z.object({
        score: z.number(),
      }),
    );
    if ('error' in data) {
      return res.status(400).send(data.error);
    }

    const user = req.user as User;

    try {
      const playId = new Types.ObjectId(query.playId);

      await GamesController.claimGame(playId, user, data.score);
    } catch (err) {
      return res.status(400).send((err as Error).message);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
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

    const user = req.user as User;

    const results = await GamesController.getLeaderboard(gameId, user);

    res.json(results);
  } catch (err) {
    next(err);
  }
});
