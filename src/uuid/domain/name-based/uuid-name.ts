import { Buffer } from 'buffer';

export class UuidName {
  private constructor(private readonly name: Buffer) {}

  static fromString(name: string): UuidName {
    return new UuidName(Buffer.from(name, 'utf8'));
  }

  asBuffer(): Buffer {
    return this.name;
  }
}
