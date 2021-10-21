// noinspection SpellCheckingInspection
const characters = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export class Base32Encoder {
  static encode(input: BigInt): string {
    let bits: string = input.toString(2);
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
