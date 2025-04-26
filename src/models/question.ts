import mongoose, { Schema } from "mongoose";
import { IQuestion } from "@/lib/types/question.types.ts";

const QuestionSchema: Schema<IQuestion> = new Schema(
  {
    QuestionId: { type: String, required: true, unique: true },
    gameId: { type: String },
    text: { type: String },
    options: [{ type: String }],
    correctIndex: { type: Number },
    difficultyRating: { type: Number },
    fileId: { type: String }, // Optional field for image-based questions
    fileAlt: { type: String }, // Optional field for image-based questions
    source: {
      type: String,
      enum: ["concept", "formula", "visual", "example"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Question =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);
