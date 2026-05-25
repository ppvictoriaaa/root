import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReminderService } from './reminder.service';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(private readonly reminderService: ReminderService) {}

  @Cron('* * * * *')
  async run() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await this.reminderService
      .sendScheduled(currentTime)
      .catch((err: Error) => this.logger.error(`Scheduler error: ${err.message}`));
  }
}
