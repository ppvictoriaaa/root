import { Test, TestingModule } from '@nestjs/testing';
import { PlantServiceController } from './plant-service.controller';
import { PlantServiceService } from './plant-service.service';

describe('PlantServiceController', () => {
  let plantServiceController: PlantServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PlantServiceController],
      providers: [PlantServiceService],
    }).compile();

    plantServiceController = app.get<PlantServiceController>(PlantServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(plantServiceController.getHello()).toBe('Hello World!');
    });
  });
});
