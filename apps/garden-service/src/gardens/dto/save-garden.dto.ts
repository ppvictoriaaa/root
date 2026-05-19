import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';

export class PlacedPlantDto {
  @IsString() id!: string;
  @IsString() plantId!: string;
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsNumber() x!: number;
  @IsNumber() y!: number;
  @IsNumber() @Min(1) count!: number;
  @IsNumber() @Min(1) plantsPerRow!: number;
  @IsNumber() @Min(0) spacing!: number;
  @IsOptional() @IsString() variety?: string;
  @IsOptional() @IsString() plantedAt?: string;
}

export class SaveGardenDto {
  @IsString() name!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => PlacedPlantDto) placedPlants!: PlacedPlantDto[];
  @IsNumber() @Min(0) plotWidthM!: number;
  @IsNumber() @Min(0) plotHeightM!: number;
  @IsNumber() @Min(0) metersPerCell!: number;
}
