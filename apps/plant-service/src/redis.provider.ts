import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider = {
  provide: REDIS_CLIENT,
  useFactory: () => new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379'),
};
