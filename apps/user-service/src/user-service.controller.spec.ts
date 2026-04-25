import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserProfile } from './schemas/user-profile.schema';

describe('UserServiceController', () => {
  let userServiceController: UserServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserServiceController],
      providers: [
        UserServiceService,
        { provide: getModelToken(UserProfile.name), useValue: {} },
      ],
    }).compile();

    userServiceController = app.get<UserServiceController>(UserServiceController);
  });

  it('should be defined', () => {
    expect(userServiceController).toBeDefined();
  });
});
