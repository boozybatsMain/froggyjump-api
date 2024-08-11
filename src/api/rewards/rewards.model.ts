import mongoose, { FilterQuery } from 'mongoose';
import { Reward } from '../../types/Reward';

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
});

export const rewardModel = mongoose.model<Reward>('Reward', schema);

export const getRewards = async (
  data: FilterQuery<Reward>,
): Promise<Reward[]> => {
  return rewardModel.find(data);
};

export const getReward = async (data: FilterQuery<Reward>): Promise<Reward> => {
  const reward = await rewardModel.findOne(data);
  if (reward == null) {
    throw new Error('Reward not found');
  }

  return reward;
};
