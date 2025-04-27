import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BullQueue } from "@/utils/bull";
import Profile from "@/models/profile";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { ApiSuccessResponse, ApiErrorResponse, GameHistoryResponse } from "@/lib/types/api.types";
import { v4 as uuidv4 } from "uuid";

// Route handler for GET - retrieve user's game history
export async function GET(): Promise<NextResponse<GameHistoryResponse | ApiErrorResponse>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized: User not authenticated",
        statusCode: 401
      }, { status: 401 });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return NextResponse.json({
        success: false,
        error: "Profile not found",
        statusCode: 404
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        gameHistory: profile.gameHistory,
      }
    });
  } catch (error) {
    console.error("Error getting game history:", error);
    await sendEmailToAdmin(
      "Error getting game history",
      "error",
      "API Error",
      `Failed to get game history: ${error}`
    );
    return NextResponse.json({
      success: false,
      error: "Failed to get game history",
      statusCode: 500
    }, { status: 500 });
  }
}

// Route handler for POST - add game history entry
export async function POST(req: NextRequest): Promise<NextResponse<ApiSuccessResponse | ApiErrorResponse>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized: User not authenticated",
        statusCode: 401
      }, { status: 401 });
    }

    const {  score } = await req.json();
    const gameId = `game_${uuidv4()}`;
    if (typeof score !== "number") {
      return NextResponse.json({
        success: false,
        error: "Score are required",
        statusCode: 400
      }, { status: 400 });
    }

    // Add game history update job to queue for background processing
    await BullQueue.add("updateGameHistory", { 
      userId, 
      gameEntry: {
        gameId,
        score,
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Game history update queued"
    });
  } catch (error) {
    console.error("Error adding game history:", error);
    await sendEmailToAdmin(
      "Error adding game history",
      "error",
      "API Error",
      `Failed to add game history: ${error}`
    );
    return NextResponse.json({
      success: false,
      error: "Failed to add game history",
      statusCode: 500
    }, { status: 500 });
  }
}
