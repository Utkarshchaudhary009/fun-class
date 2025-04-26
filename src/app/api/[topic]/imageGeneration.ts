import { google } from "./index";
import { generateText } from "ai";
import { BullQueue } from "@/utils/bull"; // The Bull queue setup

export const imageGeneration = async (prompt: string,questionId:string,fileAlt:string) => {
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
