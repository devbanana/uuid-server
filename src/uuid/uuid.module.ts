import { Module } from '@nestjs/common';
import { UuidService } from './infrastructure/uuid.service';
import { CqrsModule } from '@nestjs/cqrs';
import { UuidV1Controller } from './infrastructure/uuid-v1.controller';
import { GenerateUuidV1Handler } from './application/time-based/generate-uuid-v1.handler';
import { UuidFormatter } from './domain/uuid-formatter';
import { UuidV3Controller } from './infrastructure/uuid-v3.controller';
import { GenerateUuidV3Handler } from './application/name-based/generate-uuid-v3.handler';

const uuidServiceProvider = {
  provide: 'UuidServiceInterface',
  useClass: UuidService,
};

@Module({
  imports: [CqrsModule],
  controllers: [UuidV1Controller, UuidV3Controller],
  providers: [
    uuidServiceProvider,
    UuidFormatter,
    GenerateUuidV1Handler,
    GenerateUuidV3Handler,
  ],
})
export class UuidModule {}
