import { z } from 'zod'

export const ZQuestion = z.object({
  userId: z.string().describe('User ID'),
  QuestionId: z.string().describe('Question ID must contain 70 characters to make it unique'),
  gameId: z.string().describe('Game ID'),
  text: z.string().describe('Question text. Use Markdown for formatting.'),
  options: z.array(z.string()).describe('Options'),
  correctIndex: z.number().describe('Correct index'),
  difficultyRating: z.number().int().min(1).max(10).describe('Difficulty rating between 1 and 10'),
  fileId: z.string().optional().describe('File ID'),
  fileAlt: z.string().optional().describe('File alternative text'),
  reference: z.string().optional().describe('Reference'),
  solution: z.string().describe('Solution use Markdown for formatting.'),
  source: z.enum(['concept', 'formula', 'visual', 'example']),
})
export const ZQuestionsWithReference = z.array(ZQuestion.extend({
  refernceTopic: z.string().describe('Reference topic'),
  referncePage: z.number().int().describe('Reference page'),
  refrenceText: z.string().describe('Reference text use Markdown for formatting.'),
}).omit({gameId: true, userId: true,reference: true}))

export const ZQuestions = z.array(ZQuestion.omit({gameId: true, userId: true,reference: true}))

export interface IQuestion {
  userId: string;
  QuestionId: string;  // Question ID
  gameId: string;      // Game ID
  text: string;        // Question text
  options: string[]
  correctIndex: number
  difficultyRating: number
  fileId?: string   // Optional for image-based questions
  fileAlt?: string
  reference?: string
  refernceTopic?: string
  referncePage?: number
  refrenceText?: string
  solution?: string
  source: 'concept' | 'formula' | 'visual' | 'example'   // Type of question
  createdAt?: Date
  updatedAt?: Date
}

export interface UpsertQuestion {
  userId: string;
  QuestionId: string,
  gameId?: string
  text?: string
  options?: string[]
  correctIndex?: number
  difficultyRating?: number
  fileId?: string   // Optional for image-based questions
  fileAlt?: string
  reference?: string
  refernceTopic?: string
  referncePage?: number
  refrenceText?: string
  solution?: string
  source?: 'concept' | 'formula' | 'visual' | 'example'   // Type of question
  createdAt?: Date
  updatedAt?: Date
} 