import { validate } from 'uuid';
import { gregorianStart, UuidTime } from './uuid-time';
import { ClockSequence } from './clock-sequence';
import { Node } from './node';
import { Buffer } from 'buffer';
import { CrockfordBase32 } from 'crockford-base32';
import * as base58 from 'bs58';

export class UuidV1 {
  private constructor(private readonly uuid: Buffer) {
    if (uuid.length !== 16) {
      throw new Error('UUID must be 16 bytes');
    }

    if ((uuid.readUInt8(6) & 0xf0) !== 0x10) {
      throw new Error('UUID is not a V1 UUID');
    }

    if ((uuid.readUInt8(8) & 0xc0) !== 0x80) {
      throw new Error('UUID is not a variant 1 UUID');
    }
  }

  static fromBuffer(buffer: Buffer): UuidV1 {
    return new UuidV1(buffer);
  }

  static fromRfc4122(uuid: string): UuidV1 {
    if (!validate(uuid)) {
      throw new Error(`${uuid} is not a valid UUID`);
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
    return CrockfordBase32.encode(this.uuid);
  }

  asBase58(): string {
    return base58.encode(this.uuid);
  }

  asNumber(): BigInt {
    return (this.uuid.readBigUInt64BE(0) << 64n) | this.uuid.readBigUInt64BE(8);
  }

  asBinary(): string {
    return this.uuid.toString('binary');
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
