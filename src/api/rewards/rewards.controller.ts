import { UsersController } from '../../api/users/users.controller';
import { getUser, updateUser } from '../../api/users/users.model';
import { Types } from 'mongoose';
import { UserDoc } from '../../types/User';
import { dailyStreakRewards } from '../../utils/constants';
import { buildComplexCategory, error } from '../../utils/logger';
import { getReward, getRewards } from './rewards.model';
import {
  getReferralsEarnedSum,
  updateReferrals,
} from '../users/referral.model';

const logCategory = 'rewards.controller';

export class RewardsController {
  public static async getRewards() {
    return getRewards({});
  }

  public static async claimDailyReward(user: UserDoc) {
    const complexLogCategory = buildComplexCategory(
      logCategory,
      'claimDailyReward',
    );

    const lastClaimed = user.activity.streak.updatedAt;
    const now = Date.now();

    const lastClaimedDate = new Date(lastClaimed);
    const currentDate = new Date(now);

    if (lastClaimedDate.toDateString() === currentDate.toDateString()) {
      return;
    }

    const oneDayInMillis = 24 * 60 * 60 * 1000;
    const daysDifference = Math.floor(
      (currentDate.getTime() - lastClaimedDate.getTime()) / oneDayInMillis,
    );

    if (daysDifference > 1) {
      user.activity.streak.amount = 1;
      user.activity.streak.days = [
        currentDate.toLocaleString('en-US', { weekday: 'short' }).toLowerCase(),
      ];
    } else {
      if (user.activity.streak.amount === 30) {
        user.activity.streak.amount = 1;
      } else {
        user.activity.streak.amount++;
      }

      user.activity.streak.days.push(
        currentDate.toLocaleString('en-US', { weekday: 'short' }).toLowerCase(),
      );

      if (
        user.activity.streak.days.includes('sun') &&
        currentDate.getDay() === 1
      ) {
        user.activity.streak.days = ['mon'];
      }
    }

    user.activity.streak.updatedAt = now;

    const streakReward = dailyStreakRewards[user.activity.streak.amount];
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
            'activity.streak.days': user.activity.streak.days,
            lives: user.lives,
          },
        },
      ),
      UsersController.earnMoney(user, money),
    ]);
  }

  public static async claimReward(rewardId: Types.ObjectId, user: UserDoc) {
    const complexLogCategory = buildComplexCategory(logCategory, 'claimReward');

    const [reward, alreadyClaimed] = await Promise.all([
      getReward({
        _id: rewardId,
      }),
      getUser({
        _id: user._id,
        'claimedRewards.reward': {
          $in: [rewardId],
        },
      }).catch(() => false),
    ]);

    const { money, lives, repeatRules } = reward;

    if (alreadyClaimed) {
      if (repeatRules?.daily) {
        const userReward = user.claimedRewards.find((claimedReward) =>
          (claimedReward.reward._id as Types.ObjectId).equals(rewardId),
        );

        if (userReward == null) {
          error(
            complexLogCategory,
            new Error('Reward not found in claimedRewards'),
            undefined,
            {
              user,
              reward,
            },
          );

          throw new Error('Unexpected claimedReward error');
        }

        if (userReward.createdAt + 24 * 60 * 60 * 1000 > Date.now()) {
          throw new Error('Daily reward time not passed');
        }

        userReward.createdAt = Date.now();
      } else {
        throw new Error('Reward already claimed');
      }
    }

    if (lives != null) {
      user.lives += lives;
    }

    const promises: Promise<void>[] = [
      updateUser(
        {
          _id: user._id,
        },
        {
          ...(alreadyClaimed
            ? {
                claimedRewards: user.claimedRewards,
              }
            : {
                $push: {
                  claimedRewards: {
                    reward: rewardId,
                  },
                },
              }),
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

  public static async claimNewFriendsReward(user: UserDoc) {
    await Promise.all([
      UsersController.earnMoney(user, user.friendsEarnings.money),
      updateUser(
        {
          _id: user._id,
        },
        {
          'friendsEarnings.money': 0,
          'friendsEarnings.lives': 0,
          $inc: {
            lives: user.friendsEarnings.lives,
          },
        },
      ),
    ]);
  }

  public static async claimReferralReward(user: UserDoc) {
    const referrals = await getReferralsEarnedSum({
      user: user._id,
    });

    await Promise.all([
      UsersController.earnMoney(user, referrals),
      updateReferrals(
        {
          user: user._id,
        },
        [
          {
            $set: {
              earned: 0,
              claimed: {
                $add: ['$earned', '$claimed'],
              },
            },
          },
        ],
      ),
    ]);
  }
}
