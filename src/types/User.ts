import { Document } from 'mongoose';
import { Earnings } from './Earnings';
import { Referrals } from './Referrals';
import { Reward } from './Reward';

export interface User extends Document {
  telegramId: number;
  username: string;
  imageURL: string;
  daystreak: number;
  isKol: boolean;
  leaderboardSpot: number;
  earnings: Earnings;
  currentReward: Reward;
  rewards: Reward[];
  referrals?: Referrals;
  gamesOptions: {
    gameId: string;
    playId: string;
    amount: number;
    finished: boolean;
  }[];
  createdAt: number;
}

export interface UserView {
  telegramId: number;
  username: string;
  imageURL: string;
  daystreak: number;
  isKol: boolean;
  totalFriends: number;
  leaderboardSpot: number;
  earnings: Earnings;
  currentReward: Reward;
  rewards: Reward[];
  referrals?: Referrals;
  createdAt: number;
}
