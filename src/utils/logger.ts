import log4js from 'log4js';
import { stringify } from './string';
import { config } from '../config';
import { inspect } from 'util';
// import * as Sentry from '@sentry/node';

const logger = log4js.getLogger('node');

type AvailableLevels = 'debug' | 'info' | 'warn' | 'error';

const logMessage = (
  level: AvailableLevels,
  categoryOrMessage: string,
  message?: string,
  options?: unknown,
): void => {
  if (message != null) {
    const newLogger = log4js.getLogger(categoryOrMessage);
    newLogger.level = config.logLevel;

    if (options != null) {
      newLogger[level](message, stringify(options));
    } else {
      newLogger[level](message);
    }
  } else {
    if (options != null) {
      logger[level](categoryOrMessage, stringify(options));
    } else {
      logger[level](categoryOrMessage);
    }
  }
};

export const debug = (
  categoryOrMessage: string,
  message?: string,
  options?: unknown,
): void => {
  logMessage('debug', categoryOrMessage, message, options);
};

export const info = (
  categoryOrMessage: string,
  message?: string,
  options?: unknown,
): void => {
  logMessage('info', categoryOrMessage, message, options);
};

export const warn = (
  categoryOrMessage: string,
  message?: string,
  options?: unknown,
): void => {
  logMessage('warn', categoryOrMessage, message, options);
};

type AnyErr = Error & Record<string, unknown>;

export const error = (
  categoryOrMessage: string,
  err?: Error,
  message?: string,
  options?: unknown,
): void => {
  let formattedError: string | null = null;
  if (err != null) {
    const anyErr = err as AnyErr;

    const errObject: Record<string, unknown> = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };

    if ('response' in anyErr) {
      errObject.response = anyErr.response;
    }
    if ('request' in anyErr) {
      errObject.request = anyErr.request;
    }

    formattedError = inspect(errObject);
  }

  if (message != null) {
    if (formattedError == null) {
      formattedError = message;
    } else {
      formattedError = `${message}, error: ${formattedError}`;
    }
  }

  logMessage('error', categoryOrMessage, formattedError ?? '<empty>', options);

  // Sentry.captureException(err, {
  //   tags: {
  //     categoryOrMessage,
  //   },
  //   extra: {
  //     message,
  //     options,
  //   },
  // });
};

export const buildComplexCategory = (...categories: string[]): string => {
  return categories.join('->');
};
