import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlantCareRule, PlantCareRuleSchema } from './schemas/plant-care-rule.schema';
import { PlantCareRulesController } from './plant-care-rules.controller';
import { PlantCareRulesService } from './plant-care-rules.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PlantCareRule.name, schema: PlantCareRuleSchema }]),
  ],
  controllers: [PlantCareRulesController],
  providers: [PlantCareRulesService],
  exports: [PlantCareRulesService],
})
export class PlantCareRulesModule {}
