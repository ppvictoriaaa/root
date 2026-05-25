export class WeatherDayDto {
  date!: string;
  precip!: number;
  maxTemp!: number;
}

export class CalendarEventResponseDto {
  id!: string;
  gardenId!: string;
  plantSlug!: string;
  plantLabel?: string;
  type!: string;
  title!: string;
  description?: string;
  date!: string;
  status!: string;
  source!: string;
  weatherAdjusted!: boolean;
  accuracyLevel!: string;
  metadata?: Record<string, unknown>;
}

export class GenerateCalendarResponseDto {
  gardenId!: string;
  generatedAt!: string;
  calendarStart!: string;
  calendarEnd!: string;
  weatherApplied!: boolean;
  weatherAccuracyDays!: number;
  notice!: string;
  events!: CalendarEventResponseDto[];
  weatherDays?: WeatherDayDto[];
}

export class UpdateEventStatusDto {
  status!: 'planned' | 'done' | 'skipped';
}
