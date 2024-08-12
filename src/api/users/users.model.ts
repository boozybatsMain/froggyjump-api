import mongoose, { FilterQuery, Types } from 'mongoose';
import { UserDoc } from '../../types/User';

const populate = {
  path: 'claimedRewards.reward',
};

const schema = new mongoose.Schema({
  lives: {
    type: Number,
    default: 5,
    max: 50,
    min: 0,
  },
  referrals: {
    type: Number,
    default: 0,
    min: 0,
  },
  isKol: {
    type: Boolean,
    default: false,
  },
  telegramId: {
    type: Number,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
  inviteLinkParam: {
    type: String,
    default: null,
  },
  language: {
    type: String,
    required: true,
  },
  activity: {
    default: {
      streak: {
        amount: 0,
        days: [],
        updatedAt: 0,
      },
    },
    type: {
      streak: {
        type: {
          amount: {
            type: Number,
            default: 0,
            min: 0,
          },
          days: {
            type: [String],
            default: [],
          },
          updatedAt: {
            type: Number,
            default: 0,
          },
        },
      },
    },
  },
  earnings: {
    type: Number,
    default: 0,
    min: 0,
  },
  friendsEarnings: {
    type: {
      money: {
        type: Number,
        default: 0,
        min: 0,
      },
      lives: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    default: {
      money: 0,
      lives: 0,
    },
  },
  claimedRewards: {
    type: [
      {
        reward: {
          type: Types.ObjectId,
          ref: 'Reward',
        },
        createdAt: {
          type: Number,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
  createdAt: {
    type: Number,
    default: Date.now,
  },
});

export const userModel = mongoose.model<UserDoc>('User', schema);

export const getUser = async (
  filter: FilterQuery<UserDoc>,
): Promise<UserDoc> => {
  const user = await userModel.findOne(filter).populate(populate);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const getOrCreateUser = async (
  data: Partial<UserDoc>,
): Promise<UserDoc> => {
  const [existingUser, updatedUser] = await Promise.all([
    userModel.findOne({ telegramId: data.telegramId }).populate(populate),
    userModel.findOneAndUpdate(
      {
        telegramId: data.telegramId,
      },
      data,
      { upsert: true, new: true },
    ),
  ]);

  updatedUser.isNew = !existingUser;

  return updatedUser;
};

export const updateUser = async (
  filter: FilterQuery<UserDoc>,
  data: FilterQuery<UserDoc>,
): Promise<void> => {
  await userModel.updateOne(filter, data);
};
