# Fun Class

> A modern Next.js application with AI integration, authentication, and job processing capabilities.

## Overview

Fun Class is a Next.js application that combines AI services with user authentication and background processing. It provides a robust platform for building interactive, AI-enhanced educational experiences with real-time processing capabilities.

## Features

- ⚡ **Next.js App Router** - Built with the latest Next.js features
- 🤖 **AI Integration** - Google AI SDK implementation
- 🔒 **Authentication** - Secure user authentication via Clerk
- 📊 **Background Processing** - Job queue with BullMQ and Redis
- 🗄️ **Database** - MongoDB integration via Mongoose
- 📧 **Email Support** - Email functionality using Resend
- 🎨 **Modern UI** - Styled with TailwindCSS and animations
- 📱 **Responsive Design** - Mobile-friendly interface

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue)
![Clerk](https://img.shields.io/badge/Clerk-Authentication-purple)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![BullMQ](https://img.shields.io/badge/BullMQ-Job_Queue-red)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Redis server (for BullMQ job processing)
- MongoDB instance
- Clerk account for authentication
- Google AI API access

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd fun-class
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory:

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Redis (for BullMQ)
REDIS_URL=your_redis_url

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Folder Structure

```
fun-class/
├── src/                    # Source directory
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # React components
│   ├── lib/                # Utility libraries
│   ├── middleware.ts       # Next.js middleware
│   ├── models/             # MongoDB/Mongoose models
│   ├── utils/              # Utility functions
│   └── workers/            # Background job workers
├── public/                 # Static assets
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Available Scripts

| Command         | Description                                               |
| --------------- | --------------------------------------------------------- |
| `npm run dev`   | Starts the development server with Turbopack              |
| `npm run build` | Builds the application for production                     |
| `npm run start` | Runs the built application and starts the question worker |
| `npm run lint`  | Runs ESLint to check for code issues                      |

## Worker Processes

The application includes background processing capabilities with BullMQ and Redis. The workers include:

- **Question Worker**: Processes and stores questions in the database
- **Profile Worker**: Handles XP updates, bookmarks, and game history
- **Image Worker**: Processes and stores images using Cloudinary
- **Answer Worker**: Records user answers to questions

## API Reference

All API endpoints require authentication with Clerk unless explicitly stated. Authentication is provided through session cookies that are automatically included with requests from the frontend. Server-side API calls should include the appropriate Clerk authentication headers.

### Question APIs

#### POST `/api/[topic]`

Creates a new question in the system, processing it through a BullMQ queue.

**Successful Response (200):**

```json
data.toTextStreamResponse();
```

#### POST `/api/questions/image`

Uploads an image for a question.

**Request Body:**

| Parameter    | Type   | Required | Description               |
| ------------ | ------ | -------- | ------------------------- |
| `questionId` | string | Yes      | ID of the question        |
| `imageData`  | string | Yes      | Base64 encoded image data |
| `fileAlt`    | string | No       | Alt text for the image    |

#### GET `/api/questions`

Retrieves questions with optional filtering.

**Query Parameters:**

| Parameter    | Type   | Required | Description                     |
| ------------ | ------ | -------- | ------------------------------- |
| `gameId`     | string | No       | Filter by game ID               |
| `difficulty` | number | No       | Filter by difficulty            |
| `limit`      | number | No       | Number of results (default: 10) |
| `page`       | number | No       | Page number (default: 1)        |

### User Answer APIs

#### POST `/api/answers`

Records a user's answer to a question.

**Request Body:**

| Parameter          | Type    | Required | Description                   |
| ------------------ | ------- | -------- | ----------------------------- |
| `questionId`       | string  | Yes      | ID of the question            |
| `chosenOption`     | number  | Yes      | Index of the chosen option    |
| `isCorrect`        | boolean | Yes      | Whether the answer is correct |
| `responseTimeMs`   | number  | No       | Response time in milliseconds |
| `difficultyRating` | number  | No       | User-rated difficulty (1-5)   |

### Profile APIs

#### POST `/api/profile/xp`

Updates a user's XP.

**Request Body:**

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `xpToAdd` | number | Yes      | Amount of XP to add |

**Successful Response (200):**

```json
{
  "success": true,
  "xp": 750,
  "level": 8
}
```

#### POST `/api/profile/bookmarks`

Adds or removes a bookmark.

**Request Body:**

| Parameter    | Type   | Required | Description                    |
| ------------ | ------ | -------- | ------------------------------ |
| `questionId` | string | Yes      | ID of the question to bookmark |
| `action`     | string | Yes      | "add" or "remove"              |


#### GET `/api/profile`

Retrieves the user's profile information.

**Successful Response (200):**

```json
{
  "userId": "user_123456",
  "xp": 750,
  "level": 8,
  "bookmarks": ["q_123456", "q_234567"],
  "gameHistory": [
    {
      "gameId": "game_123456",
      "score": 85,
      "date": "2023-10-15T14:30:00Z"
    }
  ]
}
```

### Game History API

#### GET `/api/profile/gameHistory`

Retrieves the game history for the authenticated user.

**Description**

Returns an array of game history entries for the current authenticated user. Each entry includes the game ID, score, and timestamp of when the game was played.

**Authentication Required**

Yes. A valid Clerk session is required.

**Headers**

No special headers are required when using from the front-end as Clerk session cookies are automatically included.

**Response Format**

The API returns a JSON response with a success flag and the game history data.

**Successful Response (200)**

```json
{
  "success": true,
  "data": {
    "gameHistory": [
      {
        "gameId": "game_7f4c8a9b-e231-49c3-b1a5-8a9b7f4c8a9b",
        "score": 85,
        "timestamp": "2023-10-15T14:30:00Z"
      },
      {
        "gameId": "game_1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "score": 92,
        "timestamp": "2023-10-16T09:15:00Z"
      }
    ]
  }
}
```

**Error Responses**

| Status | Code           | Message                              | Description                                        |
| ------ | -------------- | ------------------------------------ | -------------------------------------------------- |
| 401    | `unauthorized` | Unauthorized: User not authenticated | The request lacks valid authentication credentials |
| 404    | `not_found`    | Profile not found                    | No profile exists for the authenticated user       |
| 500    | `server_error` | Failed to get game history           | Server encountered an unexpected error             |

#### POST `/api/profile/gameHistory`

Records a new game result in the user's history.

**Description**

Adds a new game entry to the user's game history. The game ID is automatically generated, and the entry is processed asynchronously via a BullMQ queue.

**Authentication Required**

Yes. A valid Clerk session is required.

**Request Body**

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| `score`   | number | Yes      | The score achieved in the game |

**Example Request**

```json
{
  "score": 85
}
```

**Successful Response (200)**

```json
{
  "success": true,
  "message": "Game history update queued"
}
```

**Error Responses**

| Status | Code           | Message                              | Description                                        |
| ------ | -------------- | ------------------------------------ | -------------------------------------------------- |
| 400    | `bad_request`  | Score is required                    | The score parameter is missing or invalid          |
| 401    | `unauthorized` | Unauthorized: User not authenticated | The request lacks valid authentication credentials |
| 500    | `server_error` | Failed to add game history           | Server encountered an unexpected error             |

**Processing Details**

When a POST request is made to this endpoint, the following happens:

1. The user's authentication is verified
2. A new game ID is generated using UUID
3. The request is validated to ensure a score is provided
4. A job is added to the `updateGameHistory` queue
5. The job is processed asynchronously by the Profile Worker
6. The game entry is added to the user's profile in MongoDB

**Rate Limits**

No specific rate limits are applied to this endpoint, but excessive requests may be throttled by the Redis queue.

### Data Models

#### Profile

```typescript
{
  userId: string;       // Unique identifier from Clerk
  xp: number;           // Experience points
  level: number;        // Current level
  bookmarks: string[];  // Array of bookmarked question IDs
  gameHistory: {        // Array of game history entries
    gameId: string;
    score: number;
    date: Date;
    // Additional game-specific data
  }[];
}
```

#### Question

```typescript
{
  QuestionId: string;          // Unique identifier
  userId: string;              // Creator's user ID
  gameId: string;              // Associated game ID
  text: string;                // Question text
  options: string[];           // Possible answers
  correctIndex: number;        // Index of correct answer
  difficultyRating?: number;   // Optional difficulty (1-5)
  source?: string;             // Optional source
  fileId?: string;             // Optional Cloudinary image ID
  fileAlt?: string;            // Optional image alt text
}
```

#### UserGameAnswer

```typescript
{
  userId: string;            // User ID
  questionId: string;        // Question ID
  chosenOption: number;      // Selected answer index
  isCorrect: boolean;        // Whether answer was correct
  responseTimeMs: number;    // Time taken to answer
  difficultyRating?: number; // User-rated difficulty
}
```

## Authentication

Authentication is managed via Clerk, which provides:

- User sign-up and login
- Session management
- Profile management
- OAuth integrations

## AI Integration

The application integrates with Google AI services using the AI SDK, enabling:

- Natural language processing
- AI-powered features
- Enhanced user interactions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Clerk](https://clerk.com/) - Authentication and user management
- [BullMQ](https://docs.bullmq.io/) - Job queue for Node.js
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [AI SDK](https://sdk.vercel.ai/docs) - AI integration toolkit
- [Resend](https://resend.com/) - Email API
