import { Injectable } from '@nestjs/common';
import { v1, V1Options } from 'uuid';
import { UuidServiceInterface } from '../domain/uuid-service.interface';
import { UuidV1 } from '../domain/time-based/uuid-v1';
import { UuidTime } from '../domain/time-based/uuid-time';
import { ClockSequence } from '../domain/time-based/clock-sequence';
import { Node } from '../domain/time-based/node';
import { Buffer } from 'buffer';

@Injectable()
export class UuidService implements UuidServiceInterface {
  generateV1(time?: UuidTime, clockSeq?: ClockSequence, node?: Node): UuidV1 {
    const options: V1Options = {};

    if (time !== undefined) {
      options.msecs = time.asMilliseconds();
    }
    if (clockSeq !== undefined) {
      options.clockseq = clockSeq.asNumber();
    }
    if (node !== undefined) {
      options.node = node.asByteArray();
    }

    const buffer = Buffer.alloc(16);
    v1(options, buffer);

    return UuidV1.fromBuffer(buffer);
  }
}
