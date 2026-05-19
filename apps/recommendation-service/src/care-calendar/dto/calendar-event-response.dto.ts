export class CalendarEventResponseDto {
  id!: string;
  plantSlug!: string;
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
}

export class UpdateEventStatusDto {
  status!: 'planned' | 'done' | 'skipped';
}
