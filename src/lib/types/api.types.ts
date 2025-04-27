import { z } from 'zod';

// Base API response schema with success flag and message
export const ZApiResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// Generic success response with optional data
export const ZApiSuccessResponse = ZApiResponse.extend({
  success: z.literal(true),
  data: z.unknown().optional(),
});

// Error response with error message
export const ZApiErrorResponse = ZApiResponse.extend({
  success: z.literal(false),
  error: z.string(),
  statusCode: z.number().optional(),
});

// XP response schema
export const ZXpResponse = ZApiSuccessResponse.extend({
  data: z.object({
    xp: z.number(),
    level: z.number(),
  }),
});

// Bookmarks response schema
export const ZBookmarksResponse = ZApiSuccessResponse.extend({
  data: z.object({
    bookmarks: z.array(z.string()),
  }),
});

// Game history response schema
export const ZGameHistoryResponse = ZApiSuccessResponse.extend({
  data: z.object({
    gameHistory: z.array(
      z.object({
        gameId: z.string(),
        score: z.number(),
        timestamp: z.date(),
      })
    ),
  }),
});

// Type definitions based on Zod schemas
export type ApiResponse = z.infer<typeof ZApiResponse>;
export type ApiSuccessResponse<T = unknown> = Omit<z.infer<typeof ZApiSuccessResponse>, 'data'> & { data?: T };
export type ApiErrorResponse = z.infer<typeof ZApiErrorResponse>;
export type XpResponse = z.infer<typeof ZXpResponse>;
export type BookmarksResponse = z.infer<typeof ZBookmarksResponse>;
export type GameHistoryResponse = z.infer<typeof ZGameHistoryResponse>; 