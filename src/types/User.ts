import { Document } from 'mongoose';
import { Reward } from './Reward';

export interface User extends Document {
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
  claimedRewards: Reward[];
  createdAt: number;
}

export interface UserView {
  lives: number;
  referrals: number;
  isKol: boolean;
  telegramId: number;
  username: string;
  imageURL: string;
  language: string;
  activity: {
    streak: {
      amount: number;
      days: string[];
      updatedAt: number;
    };
    invites: {
      max: number;
      amount: number;
    };
  };
  earnings: {
    total: number;
    referrals: number;
  };
  createdAt: number;
}
