import { UserDoc, UserView } from '../../types/User';
import { getOrCreateUser, updateUser } from './users.model';
import { createHmac } from 'crypto';
import { config } from '../../config';
import { z } from 'zod';
import {
  getReferral,
  getReferralsCount,
  getReferralsInfo,
  updateReferral,
} from './referral.model';
import {
  REFERRAL_COMMISION,
  REFERRAL_SECOND_LEVEL_COMMISION,
} from '../../utils/constants';
import { asyncMap } from '../../utils/async';
import { Types } from 'mongoose';
import { getPlay } from '../games/play.model';

const validAuthDuration = 10 * 60 * 60 * 1000;

const userSchema = z
  .object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    username: z.string(),
    language_code: z.string().optional(),
  })
  .passthrough();

export class UsersController {
  public static async userToView(
    user: UserDoc,
    isMe: boolean,
  ): Promise<UserView> {
    const result: UserView = {
      referrals: user.referrals,
      isKol: user.isKol,
      username: user.username,
      imageURL: user.imageURL,
    };

    if (isMe) {
      result.lives = user.lives;
      result.inviteLinkParam = user.inviteLinkParam;
      result.language = user.language;
      result.activity = {
        streak: {
          amount: user.activity.streak.amount,
          days: user.activity.streak.days,
          updatedAt: user.activity.streak.updatedAt,
        },
      };
      result.earnings = user.earnings;
      result.friendsEarnings = {
        lives: user.friendsEarnings.lives,
        money: user.friendsEarnings.money,
      };
      result.claimedRewards = user.claimedRewards.map((reward) => ({
        reward: reward.reward,
        createdAt: reward.createdAt,
      }));
      result.createdAt = user.createdAt;
    }

    return result;
  }

  private static validateHash(data: { [key: string]: string }): boolean {
    const checkString = Object.keys(data)
      .filter((key) => key !== 'hash')
      .sort((a, b) => a.localeCompare(b))
      .map((key) => {
        const value = data[key];

        return `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}`;
      })
      .join('\n');

    const secret = createHmac('sha256', 'WebAppData')
      .update(config.bot.token)
      .digest();
    const checkHash = createHmac('sha256', secret)
      .update(checkString)
      .digest('hex');

    return data.hash === checkHash;
  }

  public static parseInitData(
    initData: string,
  ): z.infer<typeof userSchema> | null {
    const data = Object.fromEntries(
      decodeURIComponent(initData)
        .split('&')
        .map((arg) => arg.split('=')),
    ) as {
      auth_date?: string;
      hash?: string;
      query_id?: string;
      user?: string;
    };

    if (!this.validateHash(data) || !data.user) {
      return null;
    }
    if (
      !data.auth_date ||
      parseInt(data.auth_date) < (Date.now() - validAuthDuration) / 1000
    ) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(data.user);
      return userSchema.parse(parsedUser);
    } catch (err) {
      return null;
    }
  }

  public static getOrCreateUser(user: Partial<UserDoc>): Promise<UserDoc> {
    return getOrCreateUser(user);
  }

  public static async earnMoney(user: UserDoc, amount: number): Promise<void> {
    user.earnings += amount;

    const [referral] = await Promise.all([
      getReferral({
        joined: user._id,
      }).catch(() => null),
      updateUser(
        {
          _id: user._id,
        },
        {
          earnings: user.earnings,
        },
      ),
    ]);

    if (referral != null) {
      const [secondReferral] = await Promise.all([
        getReferral({
          joined: referral.user,
        }).catch(() => null),
        updateReferral(
          {
            _id: referral._id,
          },
          {
            $inc: {
              earned: Math.trunc(amount * REFERRAL_COMMISION),
            },
          },
        ),
      ]);

      if (secondReferral != null) {
        await updateReferral(
          {
            _id: secondReferral._id,
          },
          {
            $inc: {
              earned: Math.trunc(amount * REFERRAL_SECOND_LEVEL_COMMISION),
            },
          },
        );
      }
    }
  }

  public static async getReferrals(
    user: UserDoc,
    filters: {
      offset?: number;
      limit?: number;
    },
  ): Promise<{
    results: {
      user: UserView;
      earned: number;
      claimed: number;
      createdAt: number;
    }[];
    meta: {
      offset: number;
      limit: number;
      total: number;
    };
  }> {
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 5;

    const [referrals, total] = await Promise.all([
      getReferralsInfo(user._id as Types.ObjectId, offset, limit),
      getReferralsCount({
        user: user._id,
      }),
    ]);

    const results = await asyncMap(referrals, async (referral) => ({
      user: await UsersController.userToView(referral.joined, false),
      earned: referral.earned,
      claimed: referral.claimed,
      createdAt: referral.createdAt,
    }));

    return {
      results,
      meta: {
        offset,
        limit,
        total,
      },
    };
  }

  public static async getCurrentPlay(user: UserDoc) {
    return getPlay({
      user: user._id,
      active: true,
    });
  }
}
