import convict from 'convict';
import dotenv from 'dotenv';

dotenv.config();

export const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  logLevel: {
    doc: 'The log level.',
    format: ['error', 'warn', 'info', 'debug'],
    default: 'info',
    env: 'LOG_LEVEL',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 80,
    env: 'PORT',
  },
  telegram: {
    token: {
      doc: 'The bot token.',
      format: String,
      default: '',
      env: 'BOT_TOKEN',
    },
    twaUrl: {
      doc: 'The TWA URL.',
      format: String,
      default: '',
      env: 'TWA_URL',
    },
  },
  mongo: {
    host: {
      doc: 'The mongo host.',
      format: String,
      default: 'localhost',
      env: 'MONGO_HOST',
    },
    port: {
      doc: 'The mongo port.',
      format: 'port',
      default: 27017,
      env: 'MONGO_PORT',
    },
    database: {
      doc: 'The mongo database.',
      format: String,
      default: 'test',
      env: 'MONGO_DATABASE',
    },
    username: {
      doc: 'The mongo username.',
      format: String,
      default: '',
      env: 'MONGO_USERNAME',
    },
    password: {
      doc: 'The mongo password.',
      format: String,
      default: '',
      env: 'MONGO_PASSWORD',
    },
  },
}).getProperties();
