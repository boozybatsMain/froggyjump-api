import { User } from 'types/User';
import { getFriendsCount, getUserFriends } from './friends.model';

export class FriendsController {
  public static getFriendsCount(telegramId: number): Promise<number> {
    return getFriendsCount(telegramId);
  }

  public static async getUserFriends(
    telegramId: number,
    offset: number,
    limit: number,
  ): Promise<{
    users: User[];
    total: number;
  }> {
    return getUserFriends(telegramId, offset, limit);
  }
}
