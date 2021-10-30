import { gregorianStart, UuidTime } from './uuid-time';
import { ClockSequence } from './clock-sequence';
import { Node } from './node';
import { Rfc4122Uuid } from '../rfc4122-uuid';

export class UuidV1 extends Rfc4122Uuid {
  static version = 1;

  get time(): UuidTime {
    const high = BigInt(this.uuid.readUInt16BE(6) & 0xfff);
    const mid = BigInt(this.uuid.readUInt16BE(4));
    const low = BigInt(this.uuid.readUInt32BE(0));

    let uuidTime = (high << 48n) | (mid << 32n) | low;
    uuidTime /= 10000n;
    uuidTime += BigInt(gregorianStart);

    return UuidTime.fromMilliseconds(Number(uuidTime));
  }

  get clockSequence(): ClockSequence {
    return ClockSequence.fromNumber(this.uuid.readUInt16BE(8) & 0x3fff);
  }

  get node(): Node {
    return Node.fromHexString(this.uuid.subarray(10).toString('hex'));
  }
}
