// import { imageGenerationTool } from "./imageGeneration";
import { CoreMessage } from "ai";
import { BullQueue } from "@/utils/bull"; // The Bull queue setup
import {
  IQuestion,
  ZQuestions,
  ZQuestionsWithReference,
} from "@/lib/types/question.types"; // Updated import
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { tool } from "ai";
import { imageGeneration } from "./imageGeneration";
// import { auth } from "@clerk/nextjs/server";

// Tool
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
export const imageGenerationTool = tool({
  description: "Generate an image based on a prompt",
  parameters: z.object({
    prompt: z.string(),
    questionId: z.string(),
    fileAlt: z.string(),
  }),
  execute: async ({ prompt, questionId, fileAlt }) => {
    const result = await imageGeneration(prompt, questionId, fileAlt);
    return `image url is ${result}`;
  },
});

export const GenQuestionId = tool({
  description: "Generate an uuid for a question",
  parameters: z.object({
    question: z.string(),
  }),
  execute: async ({ question }) => {
    const result = uuidv4();
    return `${question}-${result}`;
  },
});

// google is setup

export const google = createGoogleGenerativeAI({
  apiKey:
    process.env.GOOGLE_AI_API || "AIzaSyAZxyeKqYeGfb4kue2x58cFc1FRDtjtz4g",
});

// generate Question
const MESSAGE = (prompt: string, fileUrl: string | null) =>
  fileUrl
    ? [
        {
          role: "system" as const,
          content:
            "You are a world-class educator and expert exam setter,specialized in creating that truly leads to topic master without fearing of the topic. Progress from basic to God level slowly.",
        },
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: prompt,
            },
            {
              type: "file" as const,
              data: fileUrl,
              mimeType: "application/pdf",
            },
          ],
        },
      ]
    : [
        {
          role: "system" as const,
          content:
            "You are a world-class educator and expert exam setter,specialized in creating that truly leads to topic master without fearing of the topic. Progress from basic to God level slowly.",
        },
        {
          role: "user" as const,
          content: prompt,
        },
      ];

export const generateObject = async (
  prompt: string,
  fileUrl: string | null = null,
  noOfQuestion: number = 10
) => {
  const Response = streamObject({
    model: google("gemini-2.0-flash-exp"),
    schema: fileUrl ? ZQuestionsWithReference : ZQuestions,
    messages: MESSAGE(prompt, fileUrl) as CoreMessage[],
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
      const gameId = `q_${uuidv4()}`;
      const { userId } = { userId: "test" };
      if (userId) {
        for (const question of questions) {
          await BullQueue.add("saveQuestion", {
            userId: userId,
            QuestionId: question.QuestionId,
            gameId: gameId,
            text: question.text,
            options: question.options,
            correctIndex: question.correctIndex,
            difficultyRating: question.difficultyRating,
            fileId: question.fileId || undefined,
            source: question.source,
            reference: fileUrl || "",
            refernceTopic: question.refernceTopic || "",
            refrenceText: question.refrenceText || "",
            solution: question.solution || "",
            referncePage: question.referncePage || 0,
          } as IQuestion);
        }
      }
      console.log(`${noOfQuestion} question generated`, questions);
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
};

export const generateQuestion = async (
  prompt: string,
  fileUrl: string | null,
  noOfQuestion: number
) => {
  for (let retry = 0; retry < 10; retry++) {
    try {
      const response = await generateObject(prompt, fileUrl, noOfQuestion);
      return response;
    } catch (error) {
      if (retry < 10) {
        console.error("Error in generating question:", error);
        continue;
      }
      throw error;
    }
  }
};

// const main = async () => {
//   // const response = await generateQuestion(
//   //   "create 5 question based on subject of physics concept dimentions and units",
//   //   null,
//   //   5
//   // );
//   // for await (const partialObject of response.partialObjectStream) {
//   //   // console.clear();
//   //   console.log(partialObject);
//   // }
//   const response2 = await generateQuestion(
//     "create 5 question based on subject of physics concept dimentions and units",
//     "https://gppanchkula.ac.in/wp-content/uploads/2020/03/PHYSICS-LEARNING-MATERIAL.pdf",
//     5
//   );
//   if (response2) {
//     for await (const partialObject of response2.partialObjectStream) {
//       // console.clear();
//       console.log(partialObject);
//     }
//   } else {
//     console.error("Error in generating question:", response2);
//   }
// };
// main();
