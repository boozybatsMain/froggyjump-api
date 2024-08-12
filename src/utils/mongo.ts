import mongoose, { MongooseError } from 'mongoose';
import { buildComplexCategory, debug, error, info } from './logger';
import { database, config, up } from 'migrate-mongo';
import path from 'path';

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

  await startMigrations({
    username: options.username,
    password: options.password,
    host: options.host,
    port: options.port,
    database: options.database,
  });
};

export const startMigrations = async ({
  username,
  password,
  host,
  port,
  database: databaseName,
}: {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
}) => {
  info(logCategory, 'Starting migrations');
  const myConfig = {
    mongodb: {
      url: `mongodb://${host}:${port}/${databaseName}`,
      options: {
        auth: {
          username: username,
          password: password,
        },
      },
    },
    migrationsDir: path.join(__dirname, '..', 'migrations'),
    changelogCollectionName: 'changelog',
    migrationFileExtension: '.ts',
    useFileHash: false,
  };

  info(logCategory, 'Configuring migrations');
  config.set(myConfig);

  info(logCategory, 'Configuring set');

  const { db, client } = await database.connect();

  info(logCategory, 'Connected to database:', {
    db: db.databaseName,
  });

  const migrated = await up(db, client);

  if (migrated.length > 0) {
    migrated.forEach((fileName) => info(logCategory, 'Migrated:', fileName));
  } else {
    info(logCategory, 'No migrations to run');
  }
};
