# Profile API Endpoints

This directory contains API endpoints for managing user profiles with efficient background processing using BullMQ.

## API Response Format

All APIs follow a standardized response format:

### Success Response

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Endpoint-specific data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400 // HTTP status code
}
```

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


## XP and Level Management

**Endpoint:** `/api/profile/xp`

- `GET`: Retrieve user's current XP and level
  - Success response includes: `{ "data": { "xp": number, "level": number } }`
- `POST`: Add XP to the user's profile (level is automatically calculated)
  - Request body: `{ "xpToAdd": number }`

## Bookmarks Management

**Endpoint:** `/api/profile/bookmarks`

- `GET`: Retrieve user's bookmarked questions
  - Success response includes: `{ "data": { "bookmarks": string[] } }`
- `POST`: Add a question to user's bookmarks
  - Request body: `{ "questionId": string }`
- `DELETE`: Remove a question from user's bookmarks
  - Query parameter: `?questionId=string`

## Game History Management

**Endpoint:** `/api/profile/gameHistory`

- `GET`: Retrieve user's game history
  - Success response includes: `{ "data": { "gameHistory": { gameId: string, score: number, timestamp: Date }[] } }`
- `POST`: Add a new game entry to user's history
  - Request body: `{ "gameId": string, "score": number }`

## Implementation Details

- All operations use upsert pattern for efficiency
- All write operations are processed in the background using BullMQ
- Authentication is handled with Clerk
- Maximum concurrency is set to 25 jobs per worker
- Redis connection is optimized for 30MB Redis instances
- TypeScript interfaces enforce API response consistency
