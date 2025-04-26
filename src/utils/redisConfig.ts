/**
 * Redis connection configuration for BullMQ
 */ 
import IORedis from 'ioredis';
import { sendEmailToAdmin } from "./Mailer/Mailer";
const REDIS_URL = process.env.REDIS_URL || "redis://default:LMk7RExlcaZRXwbQuI8ML9eo5HLSMX6d@redis-12514.crce179.ap-south-1-1.ec2.redns.redis-cloud.com:12514";

export const redisConnection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

console.log(`Redis configured at ${REDIS_URL}`);

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
  sendEmailToAdmin("Redis connection error", "error", "Redis connection error", err.message);
})

redisConnection.on("connect", () => {
  console.log("Redis connected");
})

redisConnection.on("reconnecting", () => {
  console.log("Redis reconnecting");
})

redisConnection.on("end", () => {
  console.log("Redis end");
})
