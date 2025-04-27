// models/Profile.ts
import mongoose, { Schema } from 'mongoose';
import { IProfile } from '@/lib/types/profile.types';

const profileSchema = new Schema<IProfile>({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  profilePicture: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  address: { type: String, required: false },
  lastActiveAt: { type: Number, required: false },
  public_metadata: { type: Map, of: Schema.Types.Mixed, required: false },
  private_metadata: { type: Map, of: Schema.Types.Mixed, required: false },
  password_last_updated_at: { type: Number, required: false },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  bookmarks: { type: [String], default: [] },
  gameHistory: [
    {
      gameId: { type: String, required: true },
      score: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Profile = mongoose.model<IProfile>('Profile', profileSchema);

export default Profile;
