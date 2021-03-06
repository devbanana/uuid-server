import { Buffer } from 'buffer';
import { CrockfordBase32 } from 'crockford-base32';
import * as base58 from 'bs58';
import validator from 'validator';

interface UuidConstructor<T extends Uuid> {
  new (uuid: Buffer): T;
}

export abstract class Uuid {
  constructor(protected readonly uuid: Buffer) {
    const staticThis = this.constructor as typeof Uuid;

    if (!staticThis.isUuid(uuid)) {
      throw new Error('UUID must be 16 bytes');
    }

    staticThis.validate(uuid);
  }

  static isUuid(uuid: Buffer): boolean {
    return uuid.length === 16;
  }

  static fromBuffer<T extends Uuid>(
    this: UuidConstructor<T>,
    buffer: Buffer,
  ): T {
    return new this(buffer);
  }

  static fromRfc4122<T extends Uuid>(
    this: UuidConstructor<T>,
    uuid: string,
  ): T {
    return new this(Uuid.rfc4122ToBuffer(uuid));
  }

  static isValid(uuid: string | Buffer): boolean {
    if (typeof uuid === 'string') {
      uuid = this.rfc4122ToBuffer(uuid);
    }

    return this.isUuid(uuid);
  }

  protected static validate(_uuid: Buffer): void {}

  protected static rfc4122ToBuffer(uuid: string): Buffer {
    if (!validator.isUUID(uuid)) {
      throw new Error(`${uuid} is not a valid UUID`);
    }

    return Buffer.from(uuid.replace(/-/g, ''), 'hex');
  }

  toString(): string {
    return this.asRfc4122();
  }

  asBuffer(): Buffer {
    return this.uuid;
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

  asBase64(): string {
    return this.uuid.toString('base64');
  }

  asNumber(): BigInt {
    return (this.uuid.readBigUInt64BE(0) << 64n) | this.uuid.readBigUInt64BE(8);
  }

  asBinary(): string {
    return this.uuid.toString('binary');
  }
}
