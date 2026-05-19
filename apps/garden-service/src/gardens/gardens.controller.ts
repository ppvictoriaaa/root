import { Controller, Get, Post, Put, Delete, Body, Headers, Param } from '@nestjs/common';
import { GardensService } from './gardens.service';
import { SaveGardenDto } from './dto/save-garden.dto';

@Controller('gardens')
export class GardensController {
  constructor(private readonly gardensService: GardensService) {}

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.gardensService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gardensService.findById(id);
  }

  @Post()
  create(@Headers('x-user-id') userId: string, @Body() dto: SaveGardenDto) {
    return this.gardensService.create(userId, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: SaveGardenDto,
  ) {
    return this.gardensService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.gardensService.remove(id, userId);
  }
}
