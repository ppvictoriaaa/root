import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type Redis from 'ioredis';
import { Plant, PlantDocument } from './schemas/plant.schema';
import { REDIS_CLIENT } from '../redis.provider';

const CACHE_KEY = 'plants:all';
const CACHE_TTL = 60 * 60; // 1 hour

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<PlantDocument>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findAll(): Promise<PlantDocument[]> {
    try {
      const cached = await this.redis.get(CACHE_KEY);
      if (cached) return JSON.parse(cached) as PlantDocument[];
    } catch {
      // Redis unavailable — fall through to DB
    }

    const plants = await this.plantModel.find().exec();

    try {
      await this.redis.set(CACHE_KEY, JSON.stringify(plants), 'EX', CACHE_TTL);
    } catch {
      // Redis unavailable — skip caching
    }

    return plants;
  }
}
