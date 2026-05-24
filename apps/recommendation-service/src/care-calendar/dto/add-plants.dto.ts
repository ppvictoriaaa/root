import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PlantInstanceDto {
  @IsString() slug!: string;
  @IsOptional() @IsString() label?: string;
}

export class AddPlantsToCalendarDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlantInstanceDto)
  plants!: PlantInstanceDto[];
}
