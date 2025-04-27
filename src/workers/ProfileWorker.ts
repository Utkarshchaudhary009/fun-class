import { Worker, Job } from "bullmq";
import { redisConnection } from "@/utils/redisConfig";
import connectToDatabase from "@/utils/db";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import Profile from "@/models/profile";

// Ensure DB connection is established
connectToDatabase();

console.log("Profile Worker started");

// Constants for queue names
const XP_QUEUE = "updateXP";
const BOOKMARKS_QUEUE = "updateBookmarks";
const GAME_HISTORY_QUEUE = "updateGameHistory";

// Function to calculate level based on XP
const calculateLevel = (xp: number): number => {
  // Simple formula: level = 1 + floor(xp / 100)
  // Adjust formula as needed for your game progression
  return Math.floor(xp / 100) + 1;
};

// Worker for XP updates
const xpWorker = new Worker(
  XP_QUEUE,
  async (job: Job) => {
    console.log(`Processing XP job ${job.id} with data:`, job.data);
    const { userId, xpToAdd } = job.data;

    try {
      // Use findOneAndUpdate with upsert for efficient atomic operations
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { $inc: { xp: xpToAdd } },
        { new: true } // Return updated document
      );

      if (!profile) {
        throw new Error(`Profile not found for user ${userId}`);
      }

      // Calculate new level based on updated XP
      const newLevel = calculateLevel(profile.xp);

      // Update level if it has changed
      if (newLevel !== profile.level) {
        await Profile.updateOne({ userId }, { $set: { level: newLevel } });
      }

      console.log(
        `XP updated for user ${userId}. New XP: ${profile.xp}, Level: ${newLevel}`
      );
      return { success: true, xp: profile.xp, level: newLevel };
    } catch (error) {
      console.error(`Error updating XP for job ${job.id}:`, error);
      await sendEmailToAdmin(
        `Error updating XP for job ${job.id}:`,
        "error",
        "Error updating XP",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 25,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

// Worker for bookmarks updates
const bookmarksWorker = new Worker(
  BOOKMARKS_QUEUE,
  async (job: Job) => {
    console.log(`Processing bookmarks job ${job.id} with data:`, job.data);
    const { userId, questionId, action } = job.data;

    try {
      let result;

      if (action === "add") {
        // Add questionId to bookmarks array if it doesn't exist already
        result = await Profile.findOneAndUpdate(
          { userId, bookmarks: { $ne: questionId } },
          { $addToSet: { bookmarks: questionId } },
          { new: true }
        );
      } else if (action === "remove") {
        // Remove questionId from bookmarks array
        result = await Profile.findOneAndUpdate(
          { userId },
          { $pull: { bookmarks: questionId } },
          { new: true }
        );
      } else {
        throw new Error(`Invalid bookmark action: ${action}`);
      }

      if (!result) {
        throw new Error(
          `Profile not found for user ${userId} or no changes made`
        );
      }

      console.log(
        `Bookmark ${action} for user ${userId}. QuestionId: ${questionId}`
      );
      return { success: true, bookmarks: result.bookmarks };
    } catch (error) {
      console.error(`Error updating bookmarks for job ${job.id}:`, error);
      await sendEmailToAdmin(
        `Error updating bookmarks for job ${job.id}:`,
        "error",
        "Error updating bookmarks",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 25,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

// Worker for game history updates
const gameHistoryWorker = new Worker(
  GAME_HISTORY_QUEUE,
  async (job: Job) => {
    console.log(`Processing game history job ${job.id} with data:`, job.data);
    const { userId, gameEntry } = job.data;

    try {
      // Add new game entry to the gameHistory array
      const result = await Profile.findOneAndUpdate(
        { userId },
        { $push: { gameHistory: gameEntry } },
        { new: true }
      );

      if (!result) {
        throw new Error(`Profile not found for user ${userId}`);
      }

      console.log(
        `Game history updated for user ${userId}. GameId: ${gameEntry.gameId}`
      );
      return { success: true, gameHistory: result.gameHistory };
    } catch (error) {
      console.error(`Error updating game history for job ${job.id}:`, error);
      await sendEmailToAdmin(
        `Error updating game history for job ${job.id}:`,
        "error",
        "Error updating game history",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 25,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

// Event handlers for each worker
[xpWorker, bookmarksWorker, gameHistoryWorker].forEach((worker) => {
  worker.on("completed", (job: Job, result: unknown) => {
    console.log(`Job ${job.id} completed successfully. Result:`, result);
  });

  worker.on("failed", (job: Job | undefined, err: Error) => {
    const jobId = job ? job.id : "unknown";
    console.error(`Job ${jobId} failed. Error: ${err.message}`, err.stack);
  });

  worker.on("error", (err: Error) => {
    console.error("BullMQ Worker Error:", err);
  });
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("Shutting down profile workers...");
  await Promise.all([
    xpWorker.close(),
    bookmarksWorker.close(),
    gameHistoryWorker.close(),
  ]);
  console.log("Profile workers shut down.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down profile workers (SIGTERM)...");
  await Promise.all([
    xpWorker.close(),
    bookmarksWorker.close(),
    gameHistoryWorker.close(),
  ]);
  console.log("Profile workers shut down (SIGTERM).");
  process.exit(0);
});
