import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    // Console transport - always enabled except in test
    ...(!isTest
      ? [
          new winston.transports.Console({
            level: isProduction ? 'info' : 'debug',
            format: winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              winston.format.ms(),
              winston.format.errors({ stack: true }),
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, context, ms, ...meta }) => {
                const contextStr = context ? `[${context}]` : '';
                const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} ${level} ${contextStr} ${message}${metaStr} ${ms}`;
              }),
            ),
          }),
        ]
      : []),
    // File transports - production only
    ...(isProduction
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.errors({ stack: true }),
              winston.format.json(),
            ),
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ]
      : []),
  ],
};
