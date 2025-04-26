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