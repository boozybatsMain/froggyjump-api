import { Router } from 'express';
import { router as userRouter } from '../api/users/users.routes';
import { router as rewardsRouter } from './rewards/rewards.routes';
import { router as gamesRouter } from './games/games.routes';

const router = Router();

router.use('/users', userRouter);
router.use('/rewards', rewardsRouter);
router.use('/games', gamesRouter);

export default router;
