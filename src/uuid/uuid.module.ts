import { ClassProvider, Module } from '@nestjs/common';
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
import { RandomBytesProvider } from './domain/random-bytes.provider';
import { CryptoRandomBytesProvider } from './infrastructure/crypto-random-bytes.provider';
import { Md5HashProvider } from './domain/name-based/md5-hash.provider';
import { CryptoMd5HashProvider } from './infrastructure/crypto-md5-hash.provider';
import { Sha1HashProvider } from './domain/name-based/sha1-hash.provider';
import { CryptoSha1HashProvider } from './infrastructure/crypto-sha1-hash.provider';

const uuidServiceProvider = {
  provide: 'UuidServiceInterface',
  useClass: UuidService,
};

const randomBytesProvider: ClassProvider<RandomBytesProvider> = {
  provide: RandomBytesProvider,
  useClass: CryptoRandomBytesProvider,
};

const md5HashProvider: ClassProvider<Md5HashProvider> = {
  provide: Md5HashProvider,
  useClass: CryptoMd5HashProvider,
};

const sha1HashProvider: ClassProvider<Sha1HashProvider> = {
  provide: Sha1HashProvider,
  useClass: CryptoSha1HashProvider,
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
    UuidFormatter,
    uuidServiceProvider,
    randomBytesProvider,
    md5HashProvider,
    sha1HashProvider,
    GenerateUuidV1Handler,
    GenerateUuidV3Handler,
    GenerateUuidV4Handler,
    GenerateUuidV5Handler,
  ],
})
export class UuidModule {}
