import { Document } from 'mongoose';

export type Reward = {
  repeatRules?: {
    daily?: boolean;
  };
  money?: number;
  lives?: number;
  createdAt: number;
} & (
  | {
      rewardType: 'achievement';
      minScore: number;
    }
  | {
      rewardType: 'social';
      subscription: string;
    }
  | {
      rewardType: 'gyroscope';
    }
);

export type RewardDoc = Document & Reward;
