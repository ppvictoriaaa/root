import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { SoilType } from '../../common/enums/soil-type.enum';

class LocationDto {
  @IsNumber() latitude!: number;
  @IsNumber() longitude!: number;
  @IsOptional() @IsString() city?: string;
}

export class GenerateCareCalendarDto {
  @IsString() userId!: string;
  @IsString() gardenId!: string;

  @ValidateNested() @Type(() => LocationDto)
  location!: LocationDto;

  @IsOptional() @IsEnum(SoilType) soilType?: SoilType;

  // If not provided, duration is calculated automatically from the longest plant growth period.
  @IsOptional() @IsNumber() @Min(3) @Max(6) months?: number;
}
