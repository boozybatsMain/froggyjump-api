import { Router } from 'express';
import { GamesController } from './games.controller';
import { responseWithUserEarnings, validateData } from '../../utils/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import { useAuth } from '../../middlewares/useAuth.middleware';
import { UserDoc } from '../../types/User';

export const router = Router();

/**
 * @swagger
 * /games:
 *   get:
 *     tags:
 *       - Games
 *     summary: Returns a list of available games
 *     responses:
 *       200:
 *         description: A list of games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameDoc'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res, next) => {
  try {
    const games = await GamesController.getGames();
    res.json({ results: games });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /games/{gameId}/play:
 *   post:
 *     tags:
 *       - Games
 *     summary: Start a play session for a game
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the game to play
 *     responses:
 *       200:
 *         description: Play session started
 *       400:
 *         description: Invalid game ID
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post('/:gameId/play', useAuth(), async (req, res, next) => {
  try {
    const params = validateData(req.params, z.object({ gameId: z.string() }));
    if ('error' in params) {
      return res.status(400).send(params.error);
    }

    const user = req.user as UserDoc;
    const gameId = new Types.ObjectId(params.gameId);

    await GamesController.playGame(gameId, user._id as Types.ObjectId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /games/{playId}/claim:
 *   post:
 *     tags:
 *       - Games
 *     summary: Claim rewards for a completed play session
 *     parameters:
 *       - in: path
 *         name: playId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the play session to claim
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 description: The score achieved in the game
 *     responses:
 *       200:
 *         description: User's earnings after claiming the game reward
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserEarningsView'
 *       400:
 *         description: Invalid play ID or score
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post('/:playId/claim', useAuth(), async (req, res, next) => {
  try {
    const params = validateData(req.params, z.object({ playId: z.string() }));
    if ('error' in params) {
      return res.status(400).send(params.error);
    }

    const data = validateData(req.body, z.object({ score: z.number() }));
    if ('error' in data) {
      return res.status(400).send(data.error);
    }

    const user = req.user as UserDoc;

    try {
      const playId = new Types.ObjectId(params.playId);
      await GamesController.claimGame(playId, user, data.score);
    } catch (err) {
      return res.status(400).send((err as Error).message);
    }

    responseWithUserEarnings(res, user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /games/leaderboard:
 *   get:
 *     tags:
 *       - Games
 *     summary: Get the leaderboard for a specific game
 *     parameters:
 *       - in: query
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the game for which to retrieve the leaderboard
 *     responses:
 *       200:
 *         description: The leaderboard for the specified game
 *       400:
 *         description: Invalid game ID
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/leaderboard', async (req, res, next) => {
  try {
    const data = validateData(req.query, z.object({ gameId: z.string() }));
    if ('error' in data) {
      return res.status(400).send(data.error);
    }

    let gameId: Types.ObjectId;
    try {
      gameId = new Types.ObjectId(data.gameId);
    } catch (e) {
      return res.status(400).send('Invalid game id');
    }

    const user = req.user as UserDoc;
    const results = await GamesController.getLeaderboard(gameId, user);
    res.json(results);
  } catch (err) {
    next(err);
  }
});
