import { Module } from '@nestjs/common';
import { UuidService } from './infrastructure/uuid.service';

const uuidServiceProvider = {
  provide: 'UuidServiceInterface',
  useClass: UuidService,
};

@Module({
  providers: [uuidServiceProvider],
})
export class UuidModule {}
