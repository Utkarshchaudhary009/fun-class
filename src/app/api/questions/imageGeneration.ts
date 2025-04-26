import { google } from "@/app/api/questions/route";
import { generateText } from "ai";
import { tool } from "ai"
import { BullQueue } from "@/utils/bull";
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

const imageGeneration = async (prompt: string,questionId:string,fileAlt:string) => {
  for (let i = 0; i < 10; i++) {
    const result = await generateText({
      model: google("gemini-2.0-flash-exp"),
      providerOptions: {
        google: { responseModalities: ["TEXT", "IMAGE"] },
      },
      prompt: prompt,
    });

    if (result.files.length > 0) {
      for (const file of result.files) {
        if (file.mimeType.startsWith("image/")) {
          // show the image
          console.log(file.base64);
          console.log(file.uint8Array);
          console.log(file.mimeType);
          BullQueue.add("saveImage", { imageData: file.base64,questionId:questionId,fileAlt:fileAlt });
          return file.base64;
        } else {
          console.log("No image found", file);
        }
      }
    } else {
      console.log("No image found", result.text);
    }
  }
};
// imageGeneration("Generate an image of a comic cat");
