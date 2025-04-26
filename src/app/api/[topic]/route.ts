import { NextResponse } from "next/server";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { ApiResponse } from "@/lib/types";
import { generateQuestion } from "./index";
import { prop } from "@/lib/types";
export async function POST(
  req: Request,
  {params}: prop
): Promise<NextResponse | Response> {
  try {
    const { prompt } = {
      prompt: `create 10 question based on ${(await params).topic.replace("_","") || "subject of physics"}`,
    };
    const data = await generateQuestion(prompt);

    return data.toTextStreamResponse();
  } catch (error) {
    console.error("Error in creating question API:", error);
    await sendEmailToAdmin(
      "Error in creating question API",
      "error",
      "Error in creating question API",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON format",
          error: { message: "Invalid JSON format" },
        } as ApiResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to queue question",
        error: { message: "Failed to queue question" },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
