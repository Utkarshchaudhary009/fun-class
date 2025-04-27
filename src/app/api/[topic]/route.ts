import { NextResponse } from "next/server";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { ApiResponse } from "@/lib/types";
import { generateQuestion } from "./index";
import { prop } from "@/lib/types";
export async function POST(
  req: Request,
  {params}: prop
): Promise<NextResponse | Response> {
  // get the user data from the url like topic,fileUrl,noOfQuestion
  const userData = (await params).topic?.includes("&&") ? (await params).topic?.split("&&") : ["Gk",null,"10"];
  const topic = userData[0]?.toString().replace("_","") || "Gk";
  const fileUrl = userData[1] || null;
  const noOfQuestion = parseInt(userData[2] as string) || 10;
  try {
    const { prompt } = {
      prompt: `create ${noOfQuestion} question based on ${topic}`,
    };
    const data = await generateQuestion(prompt,fileUrl,noOfQuestion);
    if(data){
      return data.toTextStreamResponse();
    }else{
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate question",
          error: { message: "Failed to generate question" },
        } as ApiResponse,
        { status: 400 }
      );
    }
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
