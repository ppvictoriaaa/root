import { Controller, Get, Patch, Delete, Body, Headers } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

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
}
