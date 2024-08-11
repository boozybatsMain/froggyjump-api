import { app } from './app';
import { config } from './config';
import { info } from './utils/logger';
import { initializeMongo } from './utils/mongo';

const logCategory = 'server.ts';

(async function () {
  await initializeMongo({
    host: config.mongo.host,
    port: config.mongo.port,
    database: config.mongo.database,
    username: config.mongo.username,
    password: config.mongo.password,
  });

  app.listen(config.port, () => {
    info(logCategory, `Server is running on port ${config.port}`);
  });
})();
