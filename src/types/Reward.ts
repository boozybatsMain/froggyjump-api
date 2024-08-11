export type Reward = {
  repeatRules?: {
    daily?: boolean;
  };
  money?: number;
  lives?: number;
} & (
  | {
      rewardType: 'achievement';
      minScore: number;
    }
  | {
      rewardType: 'social';
      subscription: 'twitter' | 'telegram' | 'telegram-chat';
    }
);
