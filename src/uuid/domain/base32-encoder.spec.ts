import { Base32Encoder } from './base32-encoder';

describe('Base32Encoder', () => {
  it('can encode an even number of bits', () => {
    expect(Base32Encoder.encode(0xb4aden)).toBe('PJPY');
  });

  it('can encode a single byte', () => {
    expect(Base32Encoder.encode(0x74n)).toBe('3M');
  });

  it('can encode a large number', () => {
    expect(Base32Encoder.encode(0x593f8759e8431f5fn)).toBe('5JFW7B7M467TZ');
  });
});
