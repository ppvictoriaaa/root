import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CareCalendarEvent, CareCalendarEventDocument } from './schemas/care-calendar-event.schema';
import { CareCalendarMeta, CareCalendarMetaDocument } from './schemas/care-calendar-meta.schema';
import { GenerateCareCalendarDto } from './dto/generate-calendar.dto';
import { CalendarEventResponseDto, GenerateCalendarResponseDto } from './dto/calendar-event-response.dto';
import { CalendarGenerationService } from '../calendar-generation/calendar-generation.service';
import { CalendarEventStatus } from '../common/enums/calendar-event-status.enum';
import { toDateString } from '../common/utils/date.utils';

@Injectable()
export class CareCalendarService {
  private readonly logger = new Logger(CareCalendarService.name);

  constructor(
    @InjectModel(CareCalendarEvent.name)
    private readonly eventModel: Model<CareCalendarEventDocument>,
    @InjectModel(CareCalendarMeta.name)
    private readonly metaModel: Model<CareCalendarMetaDocument>,
    private readonly generationService: CalendarGenerationService,
  ) {}

  async generate(dto: GenerateCareCalendarDto): Promise<GenerateCalendarResponseDto> {
    // Delete old planned events so the calendar starts fresh
    await this.eventModel
      .deleteMany({ gardenId: dto.gardenId, status: CalendarEventStatus.Planned })
      .exec();
    this.logger.log(`Cleared old planned events for garden ${dto.gardenId}`);

    // Run the full generation algorithm
    const result = await this.generationService.generate(dto);

    // Persist all generated events
    if (result.events.length > 0) {
      await this.eventModel.insertMany(result.events);
    }
    this.logger.log(`Saved ${result.events.length} events for garden ${dto.gardenId}`);

    // Upsert metadata so the cron job and refresh endpoint know this garden's location
    await this.metaModel.updateOne(
      { gardenId: dto.gardenId },
      {
        $set: {
          gardenId: dto.gardenId,
          userId: dto.userId,
          location: dto.location,
          soilType: dto.soilType,
          lastGeneratedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return {
      gardenId: dto.gardenId,
      generatedAt: new Date().toISOString(),
      calendarStart: result.calendarStart,
      calendarEnd: result.calendarEnd,
      weatherApplied: result.weatherApplied,
      weatherAccuracyDays: result.weatherAccuracyDays,
      notice: result.notice,
      events: result.events.map((e) => this.toResponseDto(e as any)),
    };
  }

  async getByGarden(gardenId: string): Promise<GenerateCalendarResponseDto | null> {
    const meta = await this.metaModel.findOne({ gardenId }).lean().exec();
    if (!meta) return null;

    const events = await this.eventModel.find({ gardenId }).sort({ date: 1 }).lean().exec();
    if (events.length === 0) return null;

    const mapped = events.map((e) => this.toResponseDto(e as CareCalendarEventDocument));
    const dates  = mapped.map((e) => e.date).sort();

    return {
      gardenId,
      generatedAt: meta.lastGeneratedAt.toISOString(),
      calendarStart: dates[0],
      calendarEnd: dates[dates.length - 1],
      weatherApplied: mapped.some((e) => e.weatherAdjusted),
      weatherAccuracyDays: 0,
      notice: '',
      events: mapped,
    };
  }

  async getByGardenAndMonth(
    gardenId: string,
    year: number,
    month: number,
  ): Promise<CalendarEventResponseDto[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const events = await this.eventModel
      .find({ gardenId, date: { $gte: start, $lte: end } })
      .sort({ date: 1 })
      .lean()
      .exec();
    return events.map((e) => this.toResponseDto(e as CareCalendarEventDocument));
  }

  async updateStatus(
    eventId: string,
    status: 'planned' | 'done' | 'skipped',
  ): Promise<CalendarEventResponseDto> {
    const updated = await this.eventModel
      .findByIdAndUpdate(eventId, { $set: { status } }, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException(`Event not found: ${eventId}`);
    return this.toResponseDto(updated as CareCalendarEventDocument);
  }

  async deleteByGarden(gardenId: string): Promise<void> {
    await this.eventModel.deleteMany({ gardenId }).exec();
    await this.metaModel.deleteOne({ gardenId }).exec();
  }

  private toResponseDto(event: CareCalendarEventDocument | Record<string, any>): CalendarEventResponseDto {
    const doc = event as any;
    return {
      id: doc._id?.toString() ?? doc.id,
      plantSlug: doc.plantSlug,
      type: doc.type,
      title: doc.title,
      description: doc.description,
      date: toDateString(new Date(doc.date)),
      status: doc.status,
      source: doc.source,
      weatherAdjusted: doc.weatherAdjusted,
      accuracyLevel: doc.accuracyLevel,
      metadata: doc.metadata,
    };
  }
}
