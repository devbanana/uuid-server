import { Module } from '@nestjs/common';
import { UuidService } from './infrastructure/uuid.service';
import { CqrsModule } from '@nestjs/cqrs';
import { UuidV1Controller } from './infrastructure/uuid-v1.controller';
import { GenerateUuidV1Handler } from './application/time-based/generate-uuid-v1.handler';
import { UuidFormatter } from './domain/uuid-formatter';
import { UuidV3Controller } from './infrastructure/uuid-v3.controller';
import { GenerateUuidV3Handler } from './application/name-based/generate-uuid-v3.handler';
import { UuidV5Controller } from './infrastructure/uuid-v5.controller';
import { GenerateUuidV5Handler } from './application/name-based/generate-uuid-v5.handler';
import { UuidV4Controller } from './infrastructure/uuid-v4.controller';
import { GenerateUuidV4Handler } from './application/random/generate-uuid-v4.handler';

const uuidServiceProvider = {
  provide: 'UuidServiceInterface',
  useClass: UuidService,
};

@Module({
  imports: [CqrsModule],
  controllers: [
    UuidV1Controller,
    UuidV3Controller,
    UuidV4Controller,
    UuidV5Controller,
  ],
  providers: [
    uuidServiceProvider,
    UuidFormatter,
    GenerateUuidV1Handler,
    GenerateUuidV3Handler,
    GenerateUuidV4Handler,
    GenerateUuidV5Handler,
  ],
})
export class UuidModule {}
