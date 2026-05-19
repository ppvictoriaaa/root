import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlantCareRule, PlantCareRuleDocument } from './schemas/plant-care-rule.schema';
import { CreatePlantCareRuleDto } from './dto/create-plant-care-rule.dto';
import { UpdatePlantCareRuleDto } from './dto/update-plant-care-rule.dto';

@Injectable()
export class PlantCareRulesService {
  constructor(
    @InjectModel(PlantCareRule.name)
    private readonly ruleModel: Model<PlantCareRuleDocument>,
  ) {}

  findAll(): Promise<PlantCareRuleDocument[]> {
    return this.ruleModel.find().lean().exec() as Promise<PlantCareRuleDocument[]>;
  }

  async findBySlug(plantSlug: string): Promise<PlantCareRuleDocument> {
    const rule = await this.ruleModel.findOne({ plantSlug }).lean().exec();
    if (!rule) throw new NotFoundException(`No care rule found for plant: ${plantSlug}`);
    return rule as PlantCareRuleDocument;
  }

  async findManySlugs(slugs: string[]): Promise<PlantCareRuleDocument[]> {
    return this.ruleModel
      .find({ plantSlug: { $in: slugs } })
      .lean()
      .exec() as Promise<PlantCareRuleDocument[]>;
  }

  async create(dto: CreatePlantCareRuleDto): Promise<PlantCareRuleDocument> {
    const existing = await this.ruleModel.findOne({ plantSlug: dto.plantSlug });
    if (existing) {
      throw new BadRequestException(`A rule for plant "${dto.plantSlug}" already exists`);
    }
    const created = new this.ruleModel(dto);
    return created.save() as Promise<PlantCareRuleDocument>;
  }

  async update(plantSlug: string, dto: UpdatePlantCareRuleDto): Promise<PlantCareRuleDocument> {
    const updated = await this.ruleModel
      .findOneAndUpdate({ plantSlug }, { $set: dto }, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException(`No care rule found for plant: ${plantSlug}`);
    return updated as PlantCareRuleDocument;
  }

  async remove(plantSlug: string): Promise<void> {
    const result = await this.ruleModel.deleteOne({ plantSlug }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`No care rule found for plant: ${plantSlug}`);
    }
  }
}
