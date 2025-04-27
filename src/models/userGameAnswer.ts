import mongoose, { Schema } from 'mongoose'
import {IUserGameAnswer} from "@/lib/types/userGameAnswer.types"

const UserGameAnswerSchema: Schema<IUserGameAnswer> = new Schema(
  {
    userId: { type: String, required: true },
    gameId: { type: String, required: true },
    questionId: { type: String, required: true },
    chosenOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    responseTimeMs: { type: Number, required: true },
    difficultyRating: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Check if the model already exists before defining it
export const UserGameAnswer = mongoose.models.UserGameAnswer || mongoose.model<IUserGameAnswer>('UserGameAnswer', UserGameAnswerSchema); 