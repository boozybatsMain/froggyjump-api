import mongoose, { FilterQuery, Types } from 'mongoose';
import { User } from 'types/User';
import { LEADERBOARD_LIMIT } from 'utils/constants';

const schema = new mongoose.Schema({
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
  daystreak: {
    type: Number,
    default: 0,
  },
  isKol: {
    type: Boolean,
    default: false,
  },
  leaderboardSpot: {
    type: Number,
    default: 0,
  },
  earnings: {
    type: Types.ObjectId,
    ref: 'Earnings',
  },
  currentReward: {
    type: Types.ObjectId,
    ref: 'Reward',
  },
  rewards: {
    type: [
      {
        type: Types.ObjectId,
        ref: 'Reward',
      },
    ],
    default: [],
  },
  referrals: {
    required: false,
    type: Types.ObjectId,
    ref: 'Referrals',
  },
  gamesOptions: {
    default: [],
    type: [
      {
        gameId: Types.ObjectId,
        playId: String,
        amount: {
          type: Number,
          default: 0,
        },
        finished: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  createdAt: {
    type: Number,
    default: Date.now,
  },
});

export const userModel = mongoose.model<User>('User', schema);

export const getOrCreateUser = async (data: Partial<User>): Promise<User> => {
  return userModel.findOneAndUpdate(
    {
      telegramId: data.telegramId,
    },
    data,
    { upsert: true, new: true },
  );
};

export const updateUser = async (
  filter: FilterQuery<User>,
  data: FilterQuery<User>,
): Promise<void> => {
  await userModel.findOneAndUpdate(filter, data, { new: true });
};

export const getUsersLeaderboard = async (
  gameId: Types.ObjectId,
): Promise<User[]> => {
  return userModel
    .find({
      'gamesOptions.gameId': gameId,
    })
    .sort({ 'gamesOptions.amount': -1 })
    .slice(LEADERBOARD_LIMIT);
};
