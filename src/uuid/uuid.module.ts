import { Module } from '@nestjs/common';
import { UuidService } from './infrastructure/uuid.service';
import { CqrsModule } from '@nestjs/cqrs';
import { UuidV1Controller } from './infrastructure/uuid-v1.controller';
import { GenerateUuidV1Handler } from './application/generate-uuid-v1.handler';

const uuidServiceProvider = {
  provide: 'UuidServiceInterface',
  useClass: UuidService,
};

@Module({
  imports: [CqrsModule],
  controllers: [UuidV1Controller],
  providers: [uuidServiceProvider, GenerateUuidV1Handler],
})
export class UuidModule {}
