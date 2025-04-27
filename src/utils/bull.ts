import { Queue } from 'bullmq';
import { redisConnection } from './redisConfig'; // Import shared Redis connection config
import { Error } from 'mongoose';
import { sendEmailToAdmin } from './Mailer/Mailer';
const QUEUE_NAME = 'saveQuestion'; // Consistent queue name

console.log(`Initializing BullMQ queue: ${QUEUE_NAME}`);

export const BullQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection, // Use shared connection details
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 1000, // Initial delay 1s, then 2s, 4s
    },
    removeOnComplete: true, // Remove job from Redis once completed
    removeOnFail: false, // Keep failed jobs for inspection (can be adjusted)
  },
});

BullQueue.on("error", async (error: Error) => {
  console.error(`BullMQ Queue Error (${QUEUE_NAME}):`, error);
  await sendEmailToAdmin(
    `BullMQ Queue Error (${QUEUE_NAME}):`,
    "error",
    "BullMQ Queue Error",
    error.message
  );
  // Consider adding monitoring/alerting here
})

console.log(`BullMQ queue '${QUEUE_NAME}' initialized successfully.`);

// Optional: Add listeners for other queue events if needed
// BullQueue.on('waiting', (jobId: string) => { console.log(`Job ${jobId} is waiting.`); });
// BullQueue.on('active', (job: Job) => { console.log(`Job ${job.id} is active.`); });
// BullQueue.on('stalled', (jobId: string) => { console.log(`Job ${jobId} has stalled.`); });
// BullQueue.on('progress', (job: Job, progress) => { console.log(`Job ${job.id} progress: ${progress}`); });
// BullQueue.on('removed', (job: Job) => { console.log(`Job ${job.id} removed.`); }); 