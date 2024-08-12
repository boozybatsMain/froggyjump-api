import { Db, MongoClient } from 'mongodb';
import { Document } from 'mongoose';
import { Reward } from '../types/Reward';

const rewards: Partial<Reward>[] = [
  {
    rewardType: 'achievement',
    minScore: 5000,
    money: 1000,
    lives: 1,
  },
  {
    rewardType: 'achievement',
    minScore: 10000,
    money: 5000,
    lives: 2,
  },
  {
    rewardType: 'achievement',
    minScore: 20000,
    money: 10000,
    lives: 3,
  },
  {
    rewardType: 'achievement',
    minScore: 50000,
    money: 30000,
    lives: 5,
  },
  {
    rewardType: 'achievement',
    minScore: 100000,
    money: 100000,
    lives: 10,
  },

  {
    rewardType: 'social',
    subscription: 'twitter',
    money: 5000,
    lives: 1,
  },
  {
    rewardType: 'social',
    subscription: 'telegram',
    money: 5000,
    lives: 1,
  },
  {
    rewardType: 'social',
    subscription: 'telegram-chat',
    money: 5000,
    lives: 1,
  },
  {
    rewardType: 'social',
    subscription: 'advertising',
    money: 500,
    lives: 1,
  },
  {
    rewardType: 'social',
    subscription: 'stories',
    money: 5000,
    lives: 3,
    repeatRules: {
      daily: true,
    },
  },
];

export const up = async (db: Db, client: MongoClient): Promise<void> => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await db.collection('rewards').insertMany(rewards);
    });
  } finally {
    await session.endSession();
  }
};

export const down = async (db: Db, client: MongoClient): Promise<void> => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await db.collection('rewards').deleteMany({
        $or: rewards.map((reward) => {
          return Object.keys(reward).reduce<Record<string, unknown>>(
            (acc, key) => {
              acc[key] = (reward as any)[key];
              return acc;
            },
            {},
          );
        }),
      });
    });
  } finally {
    await session.endSession();
  }
};
