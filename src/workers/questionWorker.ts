import { Worker, Job } from "bullmq";
import { Question, IQuestion, UpsertQuestion } from "@/models/question";
import { redisConnection } from "@/utils/redisConfig";
import connectToDatabase from "@/utils/db"; // Ensure DB connection is established
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { Error } from "mongoose";
const QUEUE_NAME = "saveQuestion"; // Use a constant for the queue name
import { uploadImage } from "@/utils/cloudinary";
connectToDatabase();

console.log("Connected to database");
console.log("Worker started");

const functionForUpsertQuestion = async (
  questionId: string,
  question: UpsertQuestion
) => {
  const existingQuestion = await Question.findOne({ QuestionId: questionId });
  if (existingQuestion) {
    console.log("Question already exists");
     const updatedQuestion = await existingQuestion.updateOne(question);
     console.log(updatedQuestion);
     return updatedQuestion;
  }
  const newQuestion = await new Question(question).save();
  console.log(newQuestion);
  return newQuestion;
};
// Worker for saving questions
const questionWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    const {
      gameId,
      text,
      options,
      correctIndex,
      difficultyRating,

      source,
      QuestionId,
    }: IQuestion = job.data;

    try {
      // Save question to MongoDB
      const newQuestion = await functionForUpsertQuestion(QuestionId, {
        QuestionId,
        gameId,
        text,
        options,
        correctIndex,
        difficultyRating, // Can be undefined if not provided
        source,
      });

      console.log(
        `Question ${newQuestion._id} saved successfully for job ${job.id}`
      );
      return { questionId: newQuestion._id }; // Optionally return data on success
    } catch (error: unknown) {
      console.error(`Error saving question for job ${job.id}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await sendEmailToAdmin(
        `Error saving question for job ${job.id}:`,
        "error",
        "Error saving question",
        errorMessage
      );
      // Throw the error again to mark the job as failed
      throw error;
    }
  },
  {
    connection: redisConnection, // Use the shared Redis connection config
    limiter: {
      max: 10, // Maximum 10 concurrent saves
      duration: 1000, // Per second limit
      // groupKey: 'questionSaveLimiter' // Group key might not be needed if rate limiting the whole worker process
    },
    concurrency: 25, // Process up to 5 jobs concurrently
    removeOnComplete: { count: 0 }, // Keep logs for last 1000 completed jobs
    removeOnFail: { count: 10 }, // Keep logs for last 5000 failed jobs
  }
);

questionWorker.on("completed", (job: Job, result: string) => {
  console.log(`Job ${job.id} completed successfully. Result:`, result);
});

questionWorker.on("failed", (job: Job | undefined, err: Error) => {
  // Job might be undefined if the error happened before the job instance was fully processed
  const jobId = job ? job.id : "unknown";
  console.error(`Job ${jobId} failed. Error: ${err.message}`, err.stack);
  // Add potential monitoring/alerting here (e.g., Sentry)
});

questionWorker.on("error", (err: Error) => {
  // Handles errors like connection issues with Redis
  console.error("BullMQ Worker Error:", err);
});

console.log(`Question worker listening to queue '${QUEUE_NAME}'`);

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("Shutting down question worker...");
  await questionWorker.close();
  console.log("Question worker shut down.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down question worker (SIGTERM)...");
  await questionWorker.close();
  console.log("Question worker shut down (SIGTERM).");
  process.exit(0);
});

// Exporting the worker instance might be useful if you need to manage it elsewhere
// export default questionWorker;

const saveImageWorker = new Worker(
  "saveImage",
  async (job: Job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    const { imageData, questionId, fileAlt } = job.data;
    const image = await uploadImage(imageData);
    console.log(image);
    await functionForUpsertQuestion(questionId, {
      QuestionId: questionId,
      fileId: image,
      fileAlt: fileAlt,
    });
  },
  {
    connection: redisConnection, // Use the shared Redis connection config
    concurrency: 25, // Process up to 5 jobs concurrently
    removeOnComplete: { count: 0 }, // Keep logs for last 1000 completed jobs
    removeOnFail: { count: 10 }, // Keep logs for last 5000 failed jobs
  }
);

saveImageWorker.on("completed", (job: Job, result: string) => {
  console.log(`Job ${job.id} completed successfully. Result:`, result);
});

saveImageWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error(`Job ${job?.id} failed. Error: ${err.message}`, err.stack);
});

saveImageWorker.on("error", (err: Error) => {
  console.error("BullMQ Worker Error:", err);
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("Shutting down saveImage worker...");
  await saveImageWorker.close();
  console.log("saveImage worker shut down.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down saveImage worker (SIGTERM)...");
  await saveImageWorker.close();
  console.log("saveImage worker shut down (SIGTERM).");
  process.exit(0);
});
