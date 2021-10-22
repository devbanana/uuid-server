import { validate, version } from 'uuid';
import { gregorianStart, UuidTime } from './uuid-time';
import { ClockSequence } from './clock-sequence';
import { Node } from './node';
import { Base32Encoder } from './base32-encoder';
import { Buffer } from 'buffer';

export class UuidV1 {
  private constructor(private readonly uuid: Buffer) {}

  static fromUuid(uuid: string): UuidV1 {
    if (!validate(uuid)) {
      throw new Error(`${uuid} is not a valid UUID`);
    }
    if (version(uuid) !== 1) {
      throw new Error(`${uuid} is not a V1 UUID`);
    }

    return new UuidV1(Buffer.from(uuid.replace(/-/g, ''), 'hex'));
  }

  toString(): string {
    return this.asRfc4122();
  }

  asRfc4122(): string {
    return (
      this.uuid.subarray(0, 4).toString('hex') +
      '-' +
      this.uuid.subarray(4, 6).toString('hex') +
      '-' +
      this.uuid.subarray(6, 8).toString('hex') +
      '-' +
      this.uuid.subarray(8, 10).toString('hex') +
      '-' +
      this.uuid.subarray(10, 16).toString('hex')
    );
  }

  asBase32(): string {
    return Base32Encoder.encode(this.asNumber());
  }

  asNumber(): BigInt {
    return (this.uuid.readBigUInt64BE(0) << 64n) | this.uuid.readBigUInt64BE(8);
  }

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
