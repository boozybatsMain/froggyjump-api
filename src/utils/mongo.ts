import mongoose, { MongooseError } from 'mongoose';
import { buildComplexCategory, debug, error, info } from './logger';

const logCategory = 'mongo.ts';

export const initializeMongo = async (options: {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}): Promise<void> => {
  const complexLogCategory = buildComplexCategory(
    logCategory,
    'initializeMongo',
  );
  const commonLogOptions = {
    host: options.host,
    port: options.port,
    database: options.database,
    username: options.username,
    password: options.password.replace(/./g, '*'),
  };
  debug(complexLogCategory, 'initializing mongo', commonLogOptions);

  const mongoUri = `mongodb://${options.host}:${options.port}/${options.database}`;
  debug(complexLogCategory, 'mongo uri', { ...commonLogOptions, mongoUri });

  const db = mongoose.connection;

  db.on('connecting', () => {
    info(complexLogCategory, 'connecting to MongoDB...', commonLogOptions);
  });

  db.on('connected', () => {
    info(complexLogCategory, 'MongoDB connected!', commonLogOptions);
  });
  db.on('disconnected', () => {
    error(
      complexLogCategory,
      undefined,
      'MongoDB disconnected!',
      commonLogOptions,
    );
  });
  db.once('open', () => {
    info(complexLogCategory, 'MongoDB connection opened!', commonLogOptions);
  });
  db.on('reconnected', () => {
    info(complexLogCategory, 'MongoDB reconnected!', commonLogOptions);
  });
  db.on('close', () => {
    error(
      complexLogCategory,
      undefined,
      'MongoDB connection closed!',
      commonLogOptions,
    );
  });
  db.on('error', (err) => {
    error(complexLogCategory, err, 'MongoDB error!', commonLogOptions);
  });

  debug(complexLogCategory, 'connecting to mongo', commonLogOptions);
  await mongoose
    .connect(mongoUri, {
      user: options.username,
      pass: options.password,
    })
    .catch((err: MongooseError) => {
      error(
        complexLogCategory,
        err,
        'error while connecting to mongo',
        commonLogOptions,
      );
      throw err;
    });
};
