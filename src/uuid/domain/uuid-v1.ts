import { validate, version } from 'uuid';
import { gregorianStart, UuidTime } from './uuid-time';
import { ClockSequence } from './clock-sequence';
import { Node } from './node';

export class UuidV1 {
  private constructor(private readonly uuid: string) {}

  static fromUuid(uuid: string): UuidV1 {
    if (!validate(uuid)) {
      throw new Error(`${uuid} is not a valid UUID`);
    }
    if (version(uuid) !== 1) {
      throw new Error(`${uuid} is not a V1 UUID`);
    }

    return new UuidV1(uuid);
  }

  asString(): string {
    return this.uuid;
  }

  get time(): UuidTime {
    const high = parseInt(this.uuid.substr(14, 4), 16) & 0xfff;
    const mid = parseInt(this.uuid.substr(9, 4), 16);
    const low = parseInt(this.uuid.substr(0, 8), 16);

    let uuidTime = high * 0x1000000000000 + mid * 0x100000000 + low;
    uuidTime /= 10000;
    uuidTime += gregorianStart;

    return UuidTime.fromMilliseconds(uuidTime);
  }

  get clockSequence(): ClockSequence {
    const bytes = parseInt(this.uuid.substr(19, 4), 16);

    return ClockSequence.fromNumber(bytes & 0x3fff);
  }

  get node(): Node {
    return Node.fromHexString(this.uuid.slice(-12));
  }
}
