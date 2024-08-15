import { app } from './app';
import { config } from './config';
import { info } from './utils/logger';
import { initializeMongo } from './utils/mongo';
import { initializeTelegramBot } from './utils/telegram';

const logCategory = 'server.ts';

(async function () {
  await Promise.all([
    initializeMongo({
      host: config.mongo.host,
      port: config.mongo.port,
      database: config.mongo.database,
      username: config.mongo.username,
      password: config.mongo.password,
    }),
    initializeTelegramBot({
      token: config.telegram.token,
      twaUrl: config.telegram.twaUrl,
    }),
  ]);

  app.listen(config.port, () => {
    info(logCategory, `Server is running on port ${config.port}`);
  });
})();
