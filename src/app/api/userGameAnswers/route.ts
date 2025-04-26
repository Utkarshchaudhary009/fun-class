import { NextResponse } from "next/server";
import { UserGameAnswer } from "@/models/userGameAnswer"; // Mongoose Model for UserGameAnswer
// Assuming Mongoose connection is handled elsewhere
import mongoose from "mongoose";
import { ApiResponse } from "@/lib/types";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const data = await req.json();

    // Basic validation (add more robust validation as needed)
    if (
      !data.userId ||
      !data.questionId ||
      !data.chosenOption ||
      data.isCorrect == null ||
      data.difficultyRating == null ||
      data.responseTimeMs == null
    ) {
      await sendEmailToAdmin("Error in storing user answer API", "error", "Error in storing user answer API", "Missing required fields");
      return NextResponse.json(
        { success: false, message: "Missing required fields", error: { message: "Missing required fields" } } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate if questionId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.questionId)) {
      await sendEmailToAdmin("Error in storing user answer API", "error", "Error in storing user answer API", "Invalid question ID format");
      return NextResponse.json(
        { success: false, message: "Invalid question ID format", error: { message: "Invalid question ID format" } } as ApiResponse,
        { status: 400 }
      );
    }

    // Create a new entry in the UserGameAnswer model
    const userAnswer = new UserGameAnswer({
      userId: data.userId,
      questionId: data.questionId,
      chosenOption: data.chosenOption,
      isCorrect: data.isCorrect,
      difficultyRating: data.difficultyRating,
      responseTimeMs: data.responseTimeMs,
    });

    // Save the user's answer to the database
    await userAnswer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Answer recorded successfully",
        data: { userAnswerId: userAnswer._id }
      } as ApiResponse,
      { status: 201 }
    ); // 201 Created
  } catch (error: unknown) {
    console.error("Error in storing user answer API:", error);
    // Handle potential JSON parsing errors
    if (error instanceof SyntaxError) {
      await sendEmailToAdmin("Error in storing user answer API", "error", "Error in storing user answer API", "Invalid JSON format");
      return NextResponse.json(
        { success: false, message: "Invalid JSON format", error: { message: "Invalid JSON format" } } as ApiResponse,
        { status: 400 }
      );
    }
    // Handle potential Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      await sendEmailToAdmin("Error in storing user answer API", "error", "Error in storing user answer API", "Validation failed");
      return NextResponse.json(
        { success: false, message: "Validation failed", error: { message: "Validation failed", errors: error.errors } } as ApiResponse,
        { status: 400 }
      );
    }
    await sendEmailToAdmin("Error in storing user answer API", "error", "Error in storing user answer API", "Failed to record answer");
    return NextResponse.json(
      {
        success: false,
        message: "Failed to record answer",
        error: { message: "Failed to record answer" },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
