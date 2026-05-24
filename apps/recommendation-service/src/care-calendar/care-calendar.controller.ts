import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { CareCalendarService } from './care-calendar.service';
import { WeatherRefreshService } from './weather-refresh.service';
import { GenerateCareCalendarDto } from './dto/generate-calendar.dto';
import { AddPlantsToCalendarDto } from './dto/add-plants.dto';

@Controller('care-calendar')
export class CareCalendarController {
  constructor(
    private readonly service: CareCalendarService,
    private readonly weatherRefresh: WeatherRefreshService,
  ) {}

  @Post('generate')
  generate(@Body() dto: GenerateCareCalendarDto) {
    return this.service.generate(dto);
  }

  @Post(':gardenId/add-plants')
  addPlants(
    @Param('gardenId') gardenId: string,
    @Body() dto: AddPlantsToCalendarDto,
  ) {
    return this.service.addPlants(gardenId, dto.plants);
  }

  @Post(':gardenId/refresh-weather')
  refreshWeather(@Param('gardenId') gardenId: string) {
    return this.weatherRefresh.refreshByGardenId(gardenId);
  }

  @Get(':gardenId/month')
  getByMonth(
    @Param('gardenId') gardenId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.service.getByGardenAndMonth(gardenId, Number(year), Number(month));
  }

  @Get(':gardenId')
  async getByGarden(@Param('gardenId') gardenId: string) {
    const result = await this.service.getByGarden(gardenId);
    if (!result) throw new NotFoundException(`No calendar found for garden: ${gardenId}`);
    return result;
  }

  @Patch('events/:eventId/status')
  updateStatus(
    @Param('eventId') eventId: string,
    @Body() body: { status: 'planned' | 'done' | 'skipped' },
  ) {
    return this.service.updateStatus(eventId, body.status);
  }

  @Delete(':gardenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteByGarden(@Param('gardenId') gardenId: string) {
    return this.service.deleteByGarden(gardenId);
  }
}
