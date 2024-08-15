import { UserDoc } from './User';

export interface Leaderboard {
  leaderboard: {
    user: UserDoc;
    score: number;
    rank: number;
  }[];
  userRank: {
    user: UserDoc | null;
    score: number | null;
    rank: number | null;
  };
}
