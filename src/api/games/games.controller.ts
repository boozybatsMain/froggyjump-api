import { Types } from 'mongoose';
import { getGame, getGames } from './games.model';
import { User } from '../../types/User';
import {
  createPlay,
  getPlay,
  getUsersLeaderboard,
  updatePlay,
} from './play.model';
import { UsersController } from '../../api/users/users.controller';

export class GamesController {
  static async getGames() {
    return getGames({});
  }

  static async isPlaying(userId: Types.ObjectId) {
    try {
      getPlay({
        userId,
        active: true,
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  static async playGame(gameId: Types.ObjectId, userId: Types.ObjectId) {
    await getGame({
      _id: gameId,
    });

    if (await GamesController.isPlaying(userId)) {
      throw new Error('You are already playing this game');
    }

    await createPlay({
      game: gameId as any,
      user: userId as any,
    });
  }

  static async claimGame(playId: Types.ObjectId, user: User, score: number) {
    // check if user is belong to the play
    await getPlay({
      _id: playId,
      user: user._id,
      active: true,
    });

    let money =
      score + Math.floor(score / 10000) * 1000 + Math.floor(score / 1000) * 150;

    await Promise.all([
      updatePlay(
        {
          _id: playId,
        },
        {
          active: false,
          score,
        },
      ),
      UsersController.earnMoney(user, money),
    ]);
  }

  static async getLeaderboard(
    gameId: Types.ObjectId,
    user: User,
  ): Promise<{
    leaderboard: {
      user: User;
      score: number;
      rank: number;
    }[];
    userRank: {
      user: User | null;
      score: number | null;
      rank: number | null;
    };
  }> {
    return getUsersLeaderboard(gameId, user._id as Types.ObjectId);
  }
}
