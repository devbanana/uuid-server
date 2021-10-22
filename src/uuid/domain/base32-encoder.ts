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
}
