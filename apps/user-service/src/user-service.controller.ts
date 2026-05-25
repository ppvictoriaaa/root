import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { NotificationsService } from './notifications.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UserServiceController {
  constructor(
    private readonly userServiceService: UserServiceService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('profile')
  getProfile(@Headers('x-user-id') userId: string) {
    return this.userServiceService.getProfile(userId);
  }

  @Patch('profile')
  updateProfile(
    @Headers('x-user-id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userServiceService.updateProfile(userId, dto);
  }

  @Delete('profile')
  deleteProfile(@Headers('x-user-id') userId: string) {
    return this.userServiceService.deleteProfile(userId);
  }

  @Post('notifications/send-verification')
  sendVerification(
    @Headers('x-user-id') userId: string,
    @Body('email') email: string,
  ) {
    return this.notificationsService.sendVerification(userId, email);
  }

  @Post('notifications/verify-code')
  verifyCode(
    @Headers('x-user-id') userId: string,
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return this.notificationsService.verifyCode(userId, email, code);
  }

  @Get('notifications/garden-settings')
  getAllGardenSettings(@Headers('x-user-id') userId: string) {
    return this.notificationsService.getAllGardenSettings(userId);
  }

  @Get('notifications/garden-settings/:gardenId')
  getGardenSettings(
    @Headers('x-user-id') userId: string,
    @Param('gardenId') gardenId: string,
  ) {
    return this.notificationsService.getGardenSettings(userId, gardenId);
  }

  @Patch('notifications/garden-settings/:gardenId')
  upsertGardenSettings(
    @Headers('x-user-id') userId: string,
    @Param('gardenId') gardenId: string,
    @Body('notificationEmail') notificationEmail: string,
    @Body('daysBefore') daysBefore: number,
    @Body('time') time: string,
  ) {
    return this.notificationsService.upsertGardenSettings(
      userId,
      gardenId,
      notificationEmail,
      daysBefore,
      time,
    );
  }

  @Post('notifications/trigger-test/:gardenId')
  triggerTestReminder(
    @Headers('x-user-id') userId: string,
    @Param('gardenId') gardenId: string,
  ) {
    return this.notificationsService.triggerReminderForGarden(userId, gardenId);
  }
}
