import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { BullQueue } from "@/utils/bull"; // The Bull queue setup
import { IUserGameAnswer } from "@/lib/types/userGameAnswer.types";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const data: IUserGameAnswer = await req.json();

    // Basic validation (add more robust validation as needed)
    if (
      !data.userId ||
      !data.questionId ||
      !data.chosenOption ||
      data.isCorrect == null ||
      data.difficultyRating == null ||
      data.responseTimeMs == null
    ) {
      await sendEmailToAdmin(
        "Error in storing user answer API",
        "error",
        "Error in storing user answer API",
        "Missing required fields"
      );
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: { message: "Missing required fields" },
        } as ApiResponse,
        { status: 400 }
      );
    }

    await BullQueue.add("saveAnswer", data);

    return NextResponse.json(
      {
        success: true,
        message: "Answer recorded successfully",
        data: { userAnswerId: data.questionId },
      } as ApiResponse,
      { status: 201 }
    ); // 201 Created
  } catch (error: unknown) {
    await sendEmailToAdmin(
      "Error in storing user answer API",
      "error",
      "Error in storing user answer API",
      "Failed to record answer:" + (error as Error).message
    );
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
