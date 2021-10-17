import { Injectable } from '@nestjs/common';
import { v1, V1Options } from 'uuid';
import { UuidServiceInterface } from '../domain/uuid-service.interface';
import { UuidV1 } from '../domain/uuid-v1';
import { UuidTime } from '../domain/uuid-time';
import { ClockSequence } from '../domain/clock-sequence';

@Injectable()
export class UuidService implements UuidServiceInterface {
  generate(time?: UuidTime, clockSeq?: ClockSequence): UuidV1 {
    const options: V1Options = {};

    if (time !== undefined) {
      options.msecs = time.asMilliseconds();
    }
    if (clockSeq !== undefined) {
      options.clockseq = clockSeq.asNumber();
    }

    return UuidV1.fromUuid(v1(options));
  }
}
