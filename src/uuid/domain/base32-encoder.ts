import { Buffer } from 'buffer';

// noinspection SpellCheckingInspection
const characters = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * An implementation of the Crockford Base32 algorithm.
 *
 * Spec: https://www.crockford.com/base32.html
 */
export class Base32Encoder {
  static encode(input: Buffer | number): string {
    let pad = true;
    if (typeof input === 'number') {
      input = this.createBuffer(input);
      pad = false;
    }

    const output = [];
    // Work from the end of the buffer
    input.reverse();

    let bitsRead = 0;
    let buffer = 0;
    for (const byte of input) {
      // Add current byte to start of buffer
      buffer |= byte << bitsRead;
      bitsRead += 8;
      while (bitsRead >= 5) {
        output.unshift(buffer & 0x1f);
        buffer >>>= 5;
        bitsRead -= 5;
      }
    }

    if (bitsRead > 0) {
      output.unshift(buffer & 0x1f);
    }

    let dataStart = false;
    return output
      .filter(byte =>
        !pad && !dataStart && byte === 0 ? false : (dataStart = true),
      )
      .map(byte => characters.charAt(byte))
      .join('');
  }

  static decode(input: string): Buffer {
    // Translate input to all uppercase
    input = input.toUpperCase();
    // Translate I, L, and O to valid base 32 characters
    input = input.replace(/O/g, '0').replace(/[IL]/g, '1');

    let bits = '';
    for (const character of input) {
      const translated = characters.indexOf(character);
      if (translated === -1) {
        throw new Error(
          `Invalid base 32 character found in string: ${character}`,
        );
      }

      bits += translated.toString(2).padStart(5, '0');
    }

    const minBitLength = Math.floor(bits.length / 8) * 8;
    // See if we can strip zeros to equal minBitLength
    bits = bits.replace(
      new RegExp(`^0{${bits.length - minBitLength}}`, 'g'),
      '',
    );
    if (bits.length !== minBitLength) {
      // Pad to next byte
      bits = bits.padStart(minBitLength + 8, '0');
    }

    const bytes = bits.match(/.{8}/g);
    if (bytes === null) {
      throw new Error('Could not decode');
    }

    return Buffer.from(
      bytes
        .map(byte => parseInt(byte, 2).toString(16).padStart(2, '0'))
        .join(''),
      'hex',
    );
  }

  private static createBuffer(input: number): Buffer {
    const bytes = [];

    while (input > 0) {
      bytes.unshift(input & 0xff);
      input >>>= 8;
    }

    return Buffer.from(bytes);
  }
}
