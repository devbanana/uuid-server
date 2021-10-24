import { Buffer } from 'buffer';

// noinspection SpellCheckingInspection
const characters = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * An implementation of the Crockford Base32 algorithm.
 *
 * Spec: https://www.crockford.com/base32.html
 */
export class Base32Encoder {
  static encode(input: Buffer): string {
    let bits = '';
    input.forEach(
      (byte: number) => (bits += byte.toString(2).padStart(8, '0')),
    );

    // Pad to multiple of 5 bits
    bits = bits.padStart(Math.ceil(bits.length / 5) * 5, '0');

    const segments = bits.match(/.{5}/g);

    // istanbul ignore next: This should never happen
    if (segments === null) {
      throw new Error('Invalidly formatted input');
    }

    return segments
      .map(segment => characters.charAt(parseInt(segment, 2)))
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
}
