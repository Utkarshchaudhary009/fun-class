import mongoose, { Schema } from 'mongoose'
import { z } from 'zod'

export const ZQuestion = z.object({
  QuestionId: z.string().describe('Question ID must contain 70 characters to make it unique'),
  gameId: z.string().describe('Game ID'),
  text: z.string().describe('Question text'),
  options: z.array(z.string()).describe('Options'),
  correctIndex: z.number().describe('Correct index'),
  difficultyRating: z.number().describe('Difficulty rating'),
  fileId: z.string().optional().describe('File ID'),
  fileAlt: z.string().optional().describe('File alternative text'),
  source: z.enum(['concept', 'formula', 'visual', 'example']),
})

export const ZQuestions = z.array(ZQuestion)

export interface IQuestion {
  QuestionId: string;  // Question ID
  gameId: string;      // Game ID
  text: string;        // Question text
  options: string[]
  correctIndex: number
  difficultyRating: number
  fileId?: string   // Optional for image-based questions
  fileAlt?: string
  source: 'concept' | 'formula' | 'visual' | 'example'   // Type of question
  createdAt?: Date
  updatedAt?: Date
}
export interface UpsertQuestion {
  QuestionId: string,
  gameId?: string
  text?: string
  options?: string[]
  correctIndex?: number
  difficultyRating?: number
  fileId?: string   // Optional for image-based questions
  fileAlt?: string
  source?: 'concept' | 'formula' | 'visual' | 'example'   // Type of question
  createdAt?: Date
  updatedAt?: Date
}


const QuestionSchema: Schema<IQuestion> = new Schema(
  {
    QuestionId: { type: String, required: true, unique: true },
    gameId: { type: String},
    text: { type: String},
    options: [{ type: String}],
    correctIndex: { type: Number},
    difficultyRating: { type: Number},
    fileId: { type: String }, // Optional field for image-based questions
    fileAlt: { type: String }, // Optional field for image-based questions
    source: {
      type: String,
      enum: ['concept', 'formula', 'visual', 'example'],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema); 