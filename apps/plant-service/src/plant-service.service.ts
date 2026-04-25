import { Injectable } from '@nestjs/common';

@Injectable()
export class PlantServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
