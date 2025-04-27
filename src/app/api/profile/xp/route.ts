import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BullQueue } from "@/utils/bull";
import Profile from "@/models/profile";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { ApiSuccessResponse, ApiErrorResponse, XpResponse } from "@/lib/types/api.types";

// Route handler for GET - retrieve user's XP and level
export async function GET(): Promise<NextResponse<XpResponse | ApiErrorResponse>> {
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
        xp: profile.xp,
        level: profile.level,
      }
    });
  } catch (error) {
    console.error("Error getting XP:", error);
    await sendEmailToAdmin(
      "Error getting XP",
      "error",
      "API Error",
      `Failed to get XP: ${error}`
    );
    return NextResponse.json({
      success: false,
      error: "Failed to get XP",
      statusCode: 500
    }, { status: 500 });
  }
}

// Route handler for POST - update user's XP
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

    const { xpToAdd } = await req.json();
    if (typeof xpToAdd !== "number" || xpToAdd < 0) {
      return NextResponse.json({
        success: false,
        error: "Invalid XP amount",
        statusCode: 400
      }, { status: 400 });
    }

    // Add XP update job to queue for background processing
    await BullQueue.add("updateXP", { userId, xpToAdd });

    return NextResponse.json({
      success: true,
      message: "XP update queued"
    });
  } catch (error) {
    console.error("Error updating XP:", error);
    await sendEmailToAdmin(
      "Error updating XP",
      "error",
      "API Error",
      `Failed to update XP: ${error}`
    );
    return NextResponse.json({
      success: false,
      error: "Failed to update XP",
      statusCode: 500
    }, { status: 500 });
  }
}
