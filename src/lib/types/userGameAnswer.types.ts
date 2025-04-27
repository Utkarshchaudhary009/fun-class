import { z } from 'zod'
export interface IUserGameAnswer extends Document {
    userId: string
    questionId: string // Corrected type reference
    gameId: string
    chosenOption: string
    isCorrect: boolean
    responseTimeMs: number
    difficultyRating: number
    createdAt: Date
  }

export const ZUserGameAnswer = z.object({
  userId: z.string(),
  questionId: z.string(),
  gameId: z.string(),
  chosenOption: z.string(),
  isCorrect: z.boolean(),
  responseTimeMs: z.number(),
  difficultyRating: z.number(),
  createdAt: z.date(),
})