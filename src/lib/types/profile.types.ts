import { Document } from "mongoose";
import { z } from 'zod';

export interface IProfile extends Document {
  userId: string; // Clerk user ID
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  address?: string;
  lastActiveAt?: number;
  public_metadata?: Record<string, string|number>;
  private_metadata?: Record<string, string|number>;
  password_last_updated_at?: number;
  xp: number;
  level: number;
  bookmarks: string[];
  gameHistory: {
    gameId: string;
    score: number;
    timestamp: Date;
  }[];
}

export const ZProfile = z.object({
  userId: z.string().min(1, 'User ID is required'),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  profilePicture: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  lastActiveAt: z.number().optional(),
  public_metadata: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  private_metadata: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  password_last_updated_at: z.number().optional(),
  xp: z.number().nonnegative(),
  level: z.number().nonnegative(),
  bookmarks: z.array(z.string()).optional(),
  gameHistory: z.array(
    z.object({
      gameId: z.string().min(1, 'Game ID is required'),
      score: z.number().nonnegative(),
      timestamp: z.date(),
    })
  ),
});

export type ProfileType = z.infer<typeof ZProfile>;
