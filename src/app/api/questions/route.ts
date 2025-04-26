import { NextResponse } from "next/server";
import { BullQueue } from "@/utils/bull"; // The Bull queue setup
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { ApiResponse } from "@/lib/types";
import { IQuestion, ZQuestions } from "@/models/question"; // Not directly used here, used by the worker
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
// import { imageGenerationTool } from "./imageGeneration";
export const google = createGoogleGenerativeAI({
  apiKey:
    process.env.GOOGLE_AI_API || "AIzaSyAZxyeKqYeGfb4kue2x58cFc1FRDtjtz4g",
});

export async function generateQuestion(prompt: string) {
  const Response = streamObject({
    model: google("gemini-2.0-flash-exp"),
    schema: ZQuestions,
    prompt: prompt,
    // tools: {imageGenerationTool},
    onFinish: async (result) => {
      const questions = result.object as IQuestion[];
      if (result.error) {
        console.error("Error in generating question:", result.error);
        await sendEmailToAdmin(
          "Error in generating question",
          "error",
          "Error in generating question",
          result.error instanceof Error ? result.error.message : "Unknown error"
        );
        return;
      }
      for (const question of questions) {
        await BullQueue.add("saveQuestion", {
          QuestionId: question.QuestionId,
          gameId: question.gameId,
          text: question.text,
          options: question.options,
          correctIndex: question.correctIndex,
          difficultyRating: question.difficultyRating,
          fileId: question.fileId || undefined,
          source: question.source,
        } as IQuestion);
      }
      console.log("question generated", questions);
    },
    onError: async (error) => {
      console.error("Error in generating question:", error);
      await sendEmailToAdmin(
        "Error in generating question",
        "error",
        "Error in generating question",
        error instanceof Error ? error.message : "Unknown error"
      );
    },
  });

  return Response;
}

export async function POST(req: Request): Promise<NextResponse | Response> {
  try {
    const { prompt } = await req.json()||{ prompt: "create 10 question based on subject of physics" };
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
// const main = async () => {
//   const partialObjectStream = await generateQuestion(
//     "create 10 question based on subject of physics"
//   );
//   for await (const partialObject of partialObjectStream) {
//     // console.clear();
//     console.log(partialObject);
//   }
// };
// main();
