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
    count: number;
    money: number;
    lives: number;
  };
  claimedRewards: {
    reward: RewardDoc;
    createdAt: number;
  }[];
  lastVisit: number;
  lastNotification: number;
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
    count: number;
    money: number;
    lives: number;
  };
  claimedRewards?: {
    reward: RewardDoc;
    createdAt: number;
  }[];
  createdAt?: number;
}

export interface UserEarningsView {
  earnings: number;
}
