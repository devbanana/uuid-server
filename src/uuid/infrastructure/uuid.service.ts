import { Injectable } from '@nestjs/common';
import { v1, V1Options } from 'uuid';
import { UuidServiceInterface } from '../domain/uuid-service.interface';
import { UuidV1 } from '../domain/v1/uuid-v1';
import { UuidTime } from '../domain/v1/uuid-time';
import { ClockSequence } from '../domain/v1/clock-sequence';
import { Node } from '../domain/v1/node';
import { Buffer } from 'buffer';
import { createHash } from 'crypto';
import { UuidNamespace } from '../domain/name-based/uuid-namespace';
import { UuidName } from '../domain/name-based/uuid-name';
import { UuidV3 } from '../domain/name-based/uuid-v3';
import { UuidV5 } from '../domain/name-based/uuid-v5';

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

  generateV3(name: UuidName, namespace: UuidNamespace): Promise<UuidV3> {
    return this.createNameBasedUuid(namespace, name, 3);
  }

  generateV5(name: UuidName, namespace: UuidNamespace): Promise<UuidV5> {
    return this.createNameBasedUuid(namespace, name, 5);
  }

  private createNameBasedUuid(
    namespace: UuidNamespace,
    name: UuidName,
    version: 3 | 5,
  ): typeof version extends 3 ? Promise<UuidV3> : Promise<UuidV5> {
    const buffer = Buffer.concat([namespace.asBuffer(), name.asBuffer()]);
    const hash = createHash(version === 3 ? 'md5' : 'sha1');

    return new Promise((resolve, reject) => {
      hash.on('readable', () => {
        const data = hash.read() as unknown;

        // istanbul ignore next: Can't cause failure
        if (!(data instanceof Buffer)) {
          reject('Could not read hash');
          return;
        }

        UuidService.setVersion(data, version);
        UuidService.setVariant(data);

        resolve(
          version === 3
            ? UuidV3.fromBuffer(data) // already 128 bits
            : UuidV5.fromBuffer(data.subarray(0, 16)),
        );
      });

      hash.end(buffer);
    });
  }

  private static setVersion(data: Buffer, version: number) {
    data[6] = (data[6] & 0x0f) | (version << 4);
  }

  private static setVariant(data: Buffer) {
    data[8] = (data[8] & 0x3f) | 0x80;
  }
}
