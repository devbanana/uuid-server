import { Injectable } from '@nestjs/common';
import { v1, V1Options } from 'uuid';
import { UuidServiceInterface } from '../domain/uuid-service.interface';
import { UuidV1 } from '../domain/v1/uuid-v1';
import { UuidTime } from '../domain/v1/uuid-time';
import { ClockSequence } from '../domain/v1/clock-sequence';
import { Node } from '../domain/v1/node';
import { Buffer } from 'buffer';

@Injectable()
export class UuidService implements UuidServiceInterface {
  generate(time?: UuidTime, clockSeq?: ClockSequence, node?: Node): UuidV1 {
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
