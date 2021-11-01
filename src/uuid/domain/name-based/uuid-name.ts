import { Buffer } from 'buffer';

export class UuidName {
  private constructor(private readonly name: Buffer) {}

  static fromString(name: string): UuidName {
    if (name.length === 0) {
      throw new Error('Name cannot be empty');
    }

    return new UuidName(Buffer.from(name, 'utf8'));
  }

  asBuffer(): Buffer {
    return this.name;
  }
}
