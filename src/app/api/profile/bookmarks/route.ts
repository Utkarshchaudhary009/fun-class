import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BullQueue } from "@/utils/bull";
import Profile from "@/models/profile";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { ApiSuccessResponse, ApiErrorResponse, BookmarksResponse } from "@/lib/types/api.types";

// Route handler for GET - retrieve user's bookmarks
export async function GET(): Promise<NextResponse<BookmarksResponse | ApiErrorResponse>> {
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
        bookmarks: profile.bookmarks,
      }
    });
  } catch (error) {
    console.error("Error getting bookmarks:", error);
    await sendEmailToAdmin(
      "Error getting bookmarks",
      "error",
      "API Error",
      `Failed to get bookmarks: ${error}`
    );
    return NextResponse.json({
      success: false,
      error: "Failed to get bookmarks",
      statusCode: 500
    }, { status: 500 });
  }
}

// Route handler for POST - add bookmark
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

    const { questionId } = await req.json();
    if (!questionId) {
      return NextResponse.json({
        success: false,
        error: "Question ID is required",
        statusCode: 400
      }, { status: 400 });
    }

    // Add bookmark update job to queue for background processing
    await BullQueue.add("updateBookmarks", {
      userId,
      questionId,
      action: "add",
    });

    return NextResponse.json({
      success: true,
      message: "Bookmark update queued"
    });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    await sendEmailToAdmin(
      "Error adding bookmark",
      "error",
      "API Error",
      `Failed to add bookmark: ${error}`
    );
    return NextResponse.json({
      success: false,
      error: "Failed to add bookmark",
      statusCode: 500
    }, { status: 500 });
  }
}

// Route handler for DELETE - remove bookmark
export async function DELETE(req: NextRequest): Promise<NextResponse<ApiSuccessResponse | ApiErrorResponse>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized: User not authenticated",
        statusCode: 401
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json({
        success: false,
        error: "Question ID is required",
        statusCode: 400
      }, { status: 400 });
    }

    // Add bookmark update job to queue for background processing
    await BullQueue.add("updateBookmarks", {
      userId,
      questionId,
      action: "remove",
    });

    return NextResponse.json({
      success: true,
      message: "Bookmark removal queued"
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    await sendEmailToAdmin(
      "Error removing bookmark",
      "error",
      "API Error",
      `Failed to remove bookmark: ${error}`
    );
    return NextResponse.json({
      success: false,
      error: "Failed to remove bookmark",
      statusCode: 500
    }, { status: 500 });
  }
}
