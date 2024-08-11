import { UsersController } from '../../api/users/users.controller';
import { getUser, updateUser } from '../../api/users/users.model';
import { Types } from 'mongoose';
import { User } from '../../types/User';
import { dailyStreakRewards } from '../../utils/constants';
import { buildComplexCategory, error } from '../../utils/logger';
import { getReward, getRewards } from './rewards.model';

const logCategory = 'rewards.controller';

export class RewardsController {
  public static async getRewards() {
    return getRewards({});
  }

  public static async claimDailyReward(user: User) {
    const complexLogCategory = buildComplexCategory(
      logCategory,
      'claimDailyReward',
    );

    const lastClaimed = user.activity.streak.updatedAt;
    const now = Date.now();

    const diff = now - lastClaimed;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    if (days === 0) {
      return;
    }

    if (days > 1) {
      user.activity.streak.amount = 0;
    } else {
      if (user.activity.streak.amount === 30) {
        user.activity.streak.amount = 0;
      } else {
        user.activity.streak.amount++;
      }
    }

    user.activity.streak.updatedAt = now;

    const streakReward = dailyStreakRewards[user.activity.streak.amount - 1];
    if (streakReward == null) {
      error(
        complexLogCategory,
        new Error('dailyStreakRewards does not have that streak index'),
        undefined,
        {
          user,
        },
      );
    }
    const { money, lives } = streakReward;
    if (lives != null) {
      user.lives += lives;
    }

    await Promise.all([
      updateUser(
        {
          _id: user._id,
        },
        {
          $set: {
            'activity.streak.amount': user.activity.streak.amount,
            'activity.streak.updatedAt': user.activity.streak.updatedAt,
            lives: user.lives,
          },
        },
      ),
      UsersController.earnMoney(user, money),
    ]);
  }

  public static async claimReward(rewardId: Types.ObjectId, user: User) {
    const complexLogCategory = buildComplexCategory(logCategory, 'claimReward');

    const [isAlreadyClaimedReward, reward] = await Promise.all([
      getUser({
        _id: user._id,
        claimedRewards: {
          $in: [rewardId],
        },
      }),
      getReward({
        _id: rewardId,
      }),
    ]);

    if (isAlreadyClaimedReward) {
      error(
        complexLogCategory,
        new Error('User already claimed that reward'),
        undefined,
        {
          user,
          rewardId,
        },
      );
      return null;
    }

    const { money, lives } = reward;
    if (lives != null) {
      user.lives += lives;
    }

    const promises: Promise<void>[] = [
      updateUser(
        {
          _id: user._id,
        },
        {
          $push: {
            claimedRewards: rewardId,
          },
          $set: {
            lives: user.lives,
          },
        },
      ),
    ];

    if (money != null) {
      promises.push(UsersController.earnMoney(user, money));
    }

    await Promise.all(promises);
  }
}
