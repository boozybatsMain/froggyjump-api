import { Document } from 'mongoose';
import { RewardDoc } from './Reward';

export interface UserDoc extends Document {
  lives: number;
  referrals: number;
  isKol: boolean;
  telegramId: number;
  username: string;
  inviteLinkParam: string;
  imageURL: string;
  language: string;
  activity: {
    streak: {
      amount: number;
      days: string[];
      updatedAt: number;
    };
  };
  earnings: number;
  friendsEarnings: {
    money: number;
    lives: number;
  };
  claimedRewards: {
    reward: RewardDoc;
    createdAt: number;
  }[];
  createdAt: number;
}

export interface UserView {
  referrals: number;
  isKol: boolean;
  username: string;
  imageURL: string;
  inviteLinkParam?: string;
  language?: string;
  activity?: {
    streak: {
      amount: number;
      days: string[];
      updatedAt: number;
    };
  };
  lives?: number;
  earnings?: number;
  friendsEarnings?: {
    money: number;
    lives: number;
  };
  claimedRewards?: {
    reward: RewardDoc;
    createdAt: number;
  }[];
  createdAt?: number;
}
