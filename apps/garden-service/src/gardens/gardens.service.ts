import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Garden, GardenDocument } from './schemas/garden.schema';
import { SaveGardenDto } from './dto/save-garden.dto';

@Injectable()
export class GardensService {
  constructor(@InjectModel(Garden.name) private gardenModel: Model<GardenDocument>) {}

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
    const garden = await this.gardenModel.findById(id);
    if (!garden) throw new NotFoundException('Garden not found');
    if (garden.userId !== userId) throw new ForbiddenException();
    return this.gardenModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).lean();
  }

  async remove(id: string, userId: string) {
    const garden = await this.gardenModel.findById(id);
    if (!garden) throw new NotFoundException('Garden not found');
    if (garden.userId !== userId) throw new ForbiddenException();
    await this.gardenModel.findByIdAndDelete(id);
    return { message: 'Garden deleted' };
  }
}
