import { Injectable } from '@nestjs/common';
import { v1, V1Options } from 'uuid';
import { UuidServiceInterface } from '../domain/uuid-service.interface';
import { UuidV1 } from '../domain/uuid-v1';
import { UuidTime } from '../domain/uuid-time';

@Injectable()
export class UuidService implements UuidServiceInterface {
  generate(time?: UuidTime | undefined): UuidV1 {
    const options: V1Options = {};
    if (time !== undefined) {
      options.msecs = time.asMilliseconds();
    }

    return UuidV1.fromUuid(v1(options));
  }
}
