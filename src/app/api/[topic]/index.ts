// import { imageGenerationTool } from "./imageGeneration";

import { BullQueue } from "@/utils/bull"; // The Bull queue setup

import { IQuestion, ZQuestions } from "@/models/question"; // Not directly used here, used by the worker
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";
import { tool } from "ai";
import { imageGeneration } from "./imageGeneration";
// Tool
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
export const imageGenerationTool = tool({
  description: "Generate an image based on a prompt",
  parameters: z.object({
    prompt: z.string(),
    questionId: z.string(),
    fileAlt: z.string(),
  }),
  execute: async ({ prompt, questionId,fileAlt }) => {
    const result = await imageGeneration(prompt,questionId,fileAlt);
    return `image url is ${result}`;
  },
});

export const GenQuestionId = tool({
    description: "Generate an uuid for a question",
    parameters: z.object({
        question: z.string(),
    }),
    execute: async ({question}) => {
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


  const main = async () => {
    const response = await generateQuestion(
      "create 10 question based on subject of physics concept dimentions and units"
    );
    for await (const partialObject of response.partialObjectStream) {
      // console.clear();
      console.log(partialObject);
    }
  };
  main();