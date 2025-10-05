import 'dotenv/config';
import Redis from 'ioredis';
export const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
});
export const sub = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
});
