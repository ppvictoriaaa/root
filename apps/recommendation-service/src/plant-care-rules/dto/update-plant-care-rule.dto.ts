import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PlantCategory } from '../../common/enums/plant-category.enum';
import { VarietyType } from '../../common/enums/variety-type.enum';

class GrowthConfigUpdateDto {
  @IsOptional() @IsNumber() normalDaysToHarvest?: number;
  @IsOptional() @IsNumber() earlyCoefficient?: number;
  @IsOptional() @IsNumber() lateCoefficient?: number;
  @IsOptional() @IsNumber() summerCoefficient?: number;
  @IsOptional() @IsNumber() autumnCoefficient?: number;
  @IsOptional() @IsNumber() winterCoefficient?: number;
  @IsOptional() @IsBoolean() isPerennial?: boolean;
  @IsOptional() @IsNumber() estimatedLifespanYears?: number;
}

class WateringConfigUpdateDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsNumber() baseIntervalDays?: number;
  @IsOptional() @IsEnum(['low', 'medium', 'high']) waterNeed?: 'low' | 'medium' | 'high';
}

class FertilizingConfigUpdateDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsNumber() baseIntervalDays?: number;
  @IsOptional() @IsNumber() firstFertilizingAfterDays?: number;
}

class HarvestingConfigUpdateDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
}

export class UpdatePlantCareRuleDto {
  @IsOptional() @IsString() plantSlug?: string;
  @IsOptional() @IsEnum(PlantCategory) category?: PlantCategory;
  @IsOptional() @IsBoolean() supportsVarieties?: boolean;
  @IsOptional() @IsEnum(VarietyType) varietyType?: VarietyType;
  @IsOptional() @IsArray() @IsString({ each: true }) allowedVarieties?: string[];
  @IsOptional() @ValidateNested() @Type(() => GrowthConfigUpdateDto) growth?: GrowthConfigUpdateDto;
  @IsOptional() @ValidateNested() @Type(() => WateringConfigUpdateDto) watering?: WateringConfigUpdateDto;
  @IsOptional() @ValidateNested() @Type(() => FertilizingConfigUpdateDto) fertilizing?: FertilizingConfigUpdateDto;
  @IsOptional() @ValidateNested() @Type(() => HarvestingConfigUpdateDto) harvesting?: HarvestingConfigUpdateDto;
  @IsOptional() @IsString() notes?: string;
}
