import { Injectable } from '@nestjs/common';
import { v1, V1Options } from 'uuid';
import { UuidServiceInterface } from '../domain/uuid-service.interface';
import { UuidV1 } from '../domain/uuid-v1';

@Injectable()
export class UuidService implements UuidServiceInterface {
  generate(time?: string | undefined): UuidV1 {
    const options: V1Options = {};
    if (time !== undefined) {
      options.msecs = new Date(time).getTime();
    }

    return UuidV1.fromUuid(v1(options));
  }
}
