import { Db, MongoClient } from 'mongodb';
import { Document } from 'mongoose';
import { Game } from '../types/Game';

const games: Omit<Partial<Game>, keyof Document>[] = [
  {
    title: 'Froggy Jump',
    imageURL: '',
  },
];

export const up = async (db: Db, client: MongoClient): Promise<void> => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await db.collection('games').insertMany(games);
    });
  } finally {
    await session.endSession();
  }
};

export const down = async (db: Db, client: MongoClient): Promise<void> => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await db.collection('games').deleteMany({
        title: {
          $in: games.map((game) => game.title),
        },
      });
    });
  } finally {
    await session.endSession();
  }
};
