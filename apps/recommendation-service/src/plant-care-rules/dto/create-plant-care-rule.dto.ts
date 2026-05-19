import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PlantCategory } from '../../common/enums/plant-category.enum';
import { VarietyType } from '../../common/enums/variety-type.enum';

class GrowthConfigDto {
  @IsOptional() @IsNumber() normalDaysToHarvest?: number;
  @IsOptional() @IsNumber() earlyCoefficient?: number;
  @IsOptional() @IsNumber() lateCoefficient?: number;
  @IsOptional() @IsNumber() summerCoefficient?: number;
  @IsOptional() @IsNumber() autumnCoefficient?: number;
  @IsOptional() @IsNumber() winterCoefficient?: number;
  @IsOptional() @IsBoolean() isPerennial?: boolean;
  @IsOptional() @IsNumber() estimatedLifespanYears?: number;
}

class WateringConfigDto {
  @IsBoolean() enabled!: boolean;
  @IsOptional() @IsNumber() baseIntervalDays?: number;
  @IsOptional() @IsEnum(['low', 'medium', 'high']) waterNeed?: 'low' | 'medium' | 'high';
}

class FertilizingConfigDto {
  @IsBoolean() enabled!: boolean;
  @IsOptional() @IsNumber() baseIntervalDays?: number;
  @IsOptional() @IsNumber() firstFertilizingAfterDays?: number;
}

class HarvestingConfigDto {
  @IsBoolean() enabled!: boolean;
}

export class CreatePlantCareRuleDto {
  @IsString() plantSlug!: string;

  @IsEnum(PlantCategory) category!: PlantCategory;

  @IsBoolean() supportsVarieties!: boolean;

  @IsEnum(VarietyType) varietyType!: VarietyType;

  @IsArray() @IsString({ each: true }) allowedVarieties!: string[];

  @IsOptional() @ValidateNested() @Type(() => GrowthConfigDto)
  growth?: GrowthConfigDto;

  @ValidateNested() @Type(() => WateringConfigDto)
  watering!: WateringConfigDto;

  @ValidateNested() @Type(() => FertilizingConfigDto)
  fertilizing!: FertilizingConfigDto;

  @ValidateNested() @Type(() => HarvestingConfigDto)
  harvesting!: HarvestingConfigDto;

  @IsOptional() @IsString() notes?: string;
}
