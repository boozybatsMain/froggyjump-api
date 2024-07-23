import { Router } from 'express';
import { router as userRouter } from '../api/users/users.routes';
import { router as friendsRouter } from './friends/friends.routes';
import { router as gamesRouter } from './games/games.routes';

const router = Router();

router.use('/users', userRouter);
router.use('/friends', friendsRouter);
router.use('/games', gamesRouter);

export default router;
