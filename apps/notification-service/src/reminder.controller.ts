import { Controller, Param, Post } from '@nestjs/common';
import { ReminderService } from './reminder.service';

@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post(':userId/:gardenId')
  send(
    @Param('userId') userId: string,
    @Param('gardenId') gardenId: string,
  ) {
    return this.reminderService.sendForGarden(userId, gardenId);
  }
}
