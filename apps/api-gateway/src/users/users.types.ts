import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: { sub: string; email: string };
}

export interface UserProfile {
  userId: string;
  name: string;
  avatarUrl: string;
  gardenIds: string[];
  notificationPreferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  verifiedEmails: string[];
}

export interface GardenNotificationSettings {
  gardenId: string;
  notificationEmail: string;
  isEmailVerified: boolean;
  daysBefore: number;
  time: string;
}

export interface DeleteResult {
  message: string;
}
