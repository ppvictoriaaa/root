import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { PlantCareRulesService } from './plant-care-rules.service';
import { CreatePlantCareRuleDto } from './dto/create-plant-care-rule.dto';
import { UpdatePlantCareRuleDto } from './dto/update-plant-care-rule.dto';

@Controller('plant-care-rules')
export class PlantCareRulesController {
  constructor(private readonly service: PlantCareRulesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':plantSlug')
  findOne(@Param('plantSlug') plantSlug: string) {
    return this.service.findBySlug(plantSlug);
  }

  @Post()
  create(@Body() dto: CreatePlantCareRuleDto) {
    return this.service.create(dto);
  }

  @Patch(':plantSlug')
  update(@Param('plantSlug') plantSlug: string, @Body() dto: UpdatePlantCareRuleDto) {
    return this.service.update(plantSlug, dto);
  }

  @Delete(':plantSlug')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('plantSlug') plantSlug: string) {
    return this.service.remove(plantSlug);
  }
}
