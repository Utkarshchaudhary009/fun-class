import mongoose, { Schema, Document } from 'mongoose'

interface IUserGameAnswer extends Document {
  userId: string
  questionId: mongoose.Schema.Types.ObjectId // Corrected type reference
  chosenOption: string
  isCorrect: boolean
  responseTimeMs: number
  difficultyRating: number
  createdAt: Date
}

const UserGameAnswerSchema: Schema<IUserGameAnswer> = new Schema(
  {
    userId: { type: String, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
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