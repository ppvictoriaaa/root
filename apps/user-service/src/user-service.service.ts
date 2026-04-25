import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile, UserProfileDocument } from './schemas/user-profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectModel(UserProfile.name)
    private profileModel: Model<UserProfileDocument>,
  ) {}

  async getProfile(userId: string) {
    let profile = await this.profileModel.findOne({ userId });

    // якщо профіль ще не існує — створюємо порожній автоматично
    if (!profile) {
      profile = await this.profileModel.create({ userId });
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.profileModel.findOneAndUpdate(
      { userId },
      { $set: dto },   // $set — оновлює тільки передані поля, не чіпає решту
      { new: true, upsert: true },
      // new: true → повертає оновлений документ (не старий)
      // upsert: true → якщо не існує — створює
    );

    return profile;
  }

  async deleteProfile(userId: string) {
    await this.profileModel.deleteOne({ userId });
    return { message: 'Profile deleted' };
  }
}
