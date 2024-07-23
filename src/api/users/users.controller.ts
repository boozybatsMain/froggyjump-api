import { User, UserView } from 'types/User';
import { getOrCreateUser, updateUser } from './users.model';
import { FriendsController } from 'api/friends/friends.controller';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';

export class UsersController {
  public static async userToView(user: User): Promise<UserView> {
    let totalFriends = 0;
    if (user != null) {
      totalFriends = await FriendsController.getFriendsCount(user.telegramId);
    }

    return {
      ...user.toJSON(),
      totalFriends,
    };
  }

  public static parseInitData(initData: string): {
    userId: number;
    username: string;
  } {
    // @TODO implement
    // throw error if hash is not valid

    return {
      userId: 0,
      username: '',
    };
  }

  public static getOrCreateUser(user: Partial<User>): Promise<User> {
    return getOrCreateUser(user);
  }

  public static async claimReward(
    userId: number,
    rewardId: number,
  ): Promise<void> {
    // @TODO get next reward id
    const nextRewardId = rewardId + 1;

    await updateUser(
      {
        telegramId: userId,
      },
      {
        currentReward: nextRewardId,
        $push: {
          rewards: rewardId,
        },
      },
    );
  }

  public static async playGame(
    userId: number,
    gameId: Types.ObjectId,
  ): Promise<string> {
    const playId = randomUUID();

    await updateUser(
      {
        telegramId: userId,
      },
      {
        $push: {
          gameOptions: {
            gameId,
            playId,
          },
        },
      },
    );

    return playId;
  }

  public static async claimGame(
    userId: number,
    playId: string,
    amount: number,
  ): Promise<void> {
    await updateUser(
      {
        telegramId: userId,
        'gameOptions.playId': playId,
      },
      {
        $set: {
          'gameOptions.$.finished': true,
          'gameOptions.$.amount': amount,
        },
      },
    );
  }
}
