import { User, UserView } from '../../types/User';
import { getOrCreateUser, updateUser } from './users.model';
import { createHmac } from 'crypto';
import { config } from '../../config';
import { z } from 'zod';
import { getReferral, referralModel, updateReferral } from './referral.model';
import {
  REFERRAL_COMMISION,
  REFERRAL_SECOND_LEVEL_COMMISION,
} from '../../utils/constants';

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
  public static async userToView(user: User): Promise<UserView> {
    return user.toObject();
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

  public static getOrCreateUser(user: Partial<User>): Promise<User> {
    return getOrCreateUser(user);
  }

  public static async earnMoney(user: User, amount: number): Promise<void> {
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
          $inc: {
            'earnings.total': amount,
          },
        },
      ),
    ]);

    if (referral != null) {
      const [secondReferral] = await Promise.all([
        getReferral({
          joined: referral.joined,
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

  public static async getReferrals(user: User): Promise<User[]> {
    const referrals = await referralModel
      .find({
        user: user._id,
      })
      .populate('joined')
      .select('joined')
      .lean();

    return referrals.map((referral) => referral.joined);
  }
}
