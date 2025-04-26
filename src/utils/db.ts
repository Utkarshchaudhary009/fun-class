/**
 * Database connection utility for MongoDB using Mongoose
 */
import mongoose from "mongoose";
import { sendEmailToAdmin } from "./Mailer/Mailer";

// Set mongoose configuration to avoid deprecation warnings
mongoose.set("strictQuery", true);

// Cache the database connection
let cachedConnection: typeof mongoose | null = null;

/**
 * Connect to MongoDB database
 */
async function connectToDatabase() {
  // If the connection is cached, return it
  if (cachedConnection) {
    return cachedConnection;
  }

  // Get MongoDB connection string from environment variables
  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://Admin:iamtheadmin@funstudy.nbkoain.mongodb.net/?retryWrites=true&w=majority";

  if (!MONGODB_URI) {
    await sendEmailToAdmin(
      "Please define the MONGODB_URI environment variable in .env file",
      "error",
      "Error connecting to MongoDB",
      "Please define the MONGODB_URI environment variable in .env file"
    );
    throw new Error(
      "Please define the MONGODB_URI environment variable in .env file"
    );
  }

  // Connection options
  const options: mongoose.ConnectOptions = {
    // Add any additional connection options here if needed
  };

  try {
    const connection = await mongoose.connect(MONGODB_URI, options);

    // Log connection events
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connection established successfully");
    });

    mongoose.connection.on("error", async (err) => {
      await sendEmailToAdmin(
        "MongoDB connection error:",
        "error",
        "MongoDB connection error",
        err.message
      );
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB connection disconnected");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    // Cache the connection
    cachedConnection = connection;
    return connection;
  } catch (error) {
    await sendEmailToAdmin(
      "Error connecting to MongoDB:",
      "error",
      "Error connecting to MongoDB",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export default connectToDatabase;
