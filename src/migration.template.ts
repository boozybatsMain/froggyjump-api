import { Db, MongoClient } from 'mongodb';

export const up = async (db: Db, client: MongoClient): Promise<void> => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // await db.collection('collection name with "s" in the end').updateMany({}, {});
    });
  } finally {
    await session.endSession();
  }
};

export const down = async (db: Db, client: MongoClient): Promise<void> => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // await db.collection('collection name with "s" in the end').deleteMany({});
    });
  } finally {
    await session.endSession();
  }
};
