import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Garden, GardenDocument } from './schemas/garden.schema';
import { SaveGardenDto } from './dto/save-garden.dto';

@Injectable()
export class GardensService {
  constructor(
    @InjectModel(Garden.name) private gardenModel: Model<GardenDocument>,
  ) {}

  findAllByUser(userId: string) {
    return this.gardenModel.find({ userId }).sort({ updatedAt: -1 }).lean();
  }

  async findById(id: string) {
    const garden = await this.gardenModel.findById(id).lean();
    if (!garden) throw new NotFoundException('Garden not found');
    return garden;
  }

  create(userId: string, dto: SaveGardenDto) {
    return this.gardenModel.create({ ...dto, userId });
  }

  async update(id: string, userId: string, dto: SaveGardenDto) {
    const updated = await this.gardenModel
      .findOneAndUpdate({ _id: id, userId }, { $set: dto }, { new: true })
      .lean();
    if (!updated) {
      const exists = await this.gardenModel.exists({ _id: id });
      if (!exists) throw new NotFoundException('Garden not found');
      throw new ForbiddenException();
    }
    return updated;
  }

  async remove(id: string, userId: string) {
    const deleted = await this.gardenModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      const exists = await this.gardenModel.exists({ _id: id });
      if (!exists) throw new NotFoundException('Garden not found');
      throw new ForbiddenException();
    }
    return { message: 'Garden deleted' };
  }
}
