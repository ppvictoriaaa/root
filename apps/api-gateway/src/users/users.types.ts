import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: { userId: string; email: string };
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
}

export interface DeleteResult {
  message: string;
}
