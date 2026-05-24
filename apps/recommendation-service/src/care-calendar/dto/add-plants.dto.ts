import { IsArray, IsString } from 'class-validator';

export class AddPlantsToCalendarDto {
  @IsArray()
  @IsString({ each: true })
  slugs!: string[];
}
