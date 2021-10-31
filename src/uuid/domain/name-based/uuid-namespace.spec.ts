import { UuidNamespace } from './uuid-namespace';
import { Buffer } from 'buffer';

describe('UuidNamespace', () => {
  it('must be 16 bytes', () => {
    expect(() => UuidNamespace.fromBuffer(Buffer.from('foo'))).toThrowError(
      'must be 16 bytes',
    );
  });

  it('should accept any valid UUID', () => {
    expect(() =>
      UuidNamespace.fromBuffer(Buffer.from('L7D1k77gJAfAKqR8')),
    ).not.toThrowError();
  });
});
