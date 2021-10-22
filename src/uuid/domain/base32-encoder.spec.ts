import { Base32Encoder } from './base32-encoder';
import { Buffer } from 'buffer';

describe('Base32Encoder', () => {
  it('can encode an multiple of 5 bits', () => {
    // noinspection SpellCheckingInspection
    expect(
      Base32Encoder.encode(Buffer.from([0xa6, 0xe5, 0x63, 0x34, 0x5f])),
    ).toBe('MVJP6D2Z');
  });

  it('can encode a single byte', () => {
    expect(Base32Encoder.encode(Buffer.from([0x74]))).toBe('3M');
  });

  it('can encode a large number', () => {
    expect(Base32Encoder.encode(Buffer.from('593f8759e8431f5f', 'hex'))).toBe(
      '5JFW7B7M467TZ',
    );
  });

  it('does not strip off leading zeros', () => {
    expect(Base32Encoder.encode(Buffer.from([0, 0, 0xa9]))).toBe('00059');
  });
});
