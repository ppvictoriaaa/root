import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserProfile,
  UserProfileDocument,
} from './schemas/user-profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectModel(UserProfile.name)
    private profileModel: Model<UserProfileDocument>,
  ) {}

  async getProfile(userId: string) {
    let profile = await this.profileModel.findOne({ userId });

    if (!profile) {
      profile = await this.profileModel.create({ userId });
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.profileModel.findOneAndUpdate(
      { userId },
      { $set: dto },
      { new: true, upsert: true },
    );

    return profile;
  }

  async deleteProfile(userId: string) {
    await this.profileModel.deleteOne({ userId });
    return { message: 'Profile deleted' };
  }
}
