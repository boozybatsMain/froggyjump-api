import { Types } from 'mongoose';
import { getGames } from './games.model';
import { getUsersLeaderboard } from 'api/users/users.model';
import { User } from 'types/User';

export class GamesController {
  static async getGames() {
    return getGames({});
  }

  static async getLeaderboard(gameId: Types.ObjectId): Promise<User[]> {
    return getUsersLeaderboard(gameId);
  }
}
