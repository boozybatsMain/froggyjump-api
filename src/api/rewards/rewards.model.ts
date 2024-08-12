import mongoose, { FilterQuery } from 'mongoose';
import { RewardDoc } from '../../types/Reward';

const schema = new mongoose.Schema({
  rewardType: {
    type: String,
    required: true,
    enum: ['achievement', 'social'],
  },
  money: {
    type: Number,
    required: false,
  },
  lives: {
    type: Number,
    required: false,
  },
  repeatRules: {
    required: false,
    type: {
      daily: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
  },
  minScore: {
    type: Number,
    required: function (this: any) {
      return this.type === 'achievement';
    },
  },
  subscription: {
    type: String,
    required: function (this: any) {
      return this.type === 'social';
    },
    enum: ['twitter', 'telegram', 'telegram-chat'],
  },
  createdAt: {
    type: Number,
    default: Date.now,
  },
});

export const rewardModel = mongoose.model<RewardDoc>('Reward', schema);

export const getRewards = async (
  data: FilterQuery<RewardDoc>,
): Promise<RewardDoc[]> => {
  return rewardModel.find(data);
};

export const getReward = async (
  data: FilterQuery<RewardDoc>,
): Promise<RewardDoc> => {
  const reward = await rewardModel.findOne(data);
  if (reward == null) {
    throw new Error('Reward not found');
  }

  return reward;
};
