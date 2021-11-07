import { Uuid } from './uuid';
import { Buffer } from 'buffer';

export abstract class Rfc4122Uuid extends Uuid {
  static version?: number = undefined;

  protected static validate(uuid: Buffer): void {
    if ((uuid.readUInt8(8) & 0xc0) !== 0x80) {
      throw new Error('UUID is not a variant 1 UUID');
    }

    if (!this.isCorrectVersion(uuid)) {
      throw new Error(
        `UUID is not a ${
          this.version === undefined
            ? 'valid RFC4122 UUID'
            : `V${this.version} UUID`
        }`,
      );
    }
  }

  static isValid(uuid: string | Buffer): boolean {
    if (typeof uuid === 'string') {
      uuid = this.rfc4122ToBuffer(uuid);
    }

    return this.isUuid(uuid) && this.isCorrectVersion(uuid);
  }

  static versionOf(uuid: string | Buffer): number {
    if (typeof uuid === 'string') {
      uuid = this.rfc4122ToBuffer(uuid);
    }

    return this.readVersion(uuid);
  }

  protected static isCorrectVersion(uuid: Buffer): boolean {
    if (this.version === undefined) {
      throw new Error('Version must be defined');
    }

    return this.readVersion(uuid) === this.version;
  }

  private static readVersion(uuid: Buffer): number {
    return (uuid.readUInt8(6) & 0xf0) >>> 4;
  }

  get version(): number {
    return Rfc4122Uuid.readVersion(this.uuid);
  }
}
