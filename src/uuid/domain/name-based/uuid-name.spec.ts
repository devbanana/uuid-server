import { UuidName } from './uuid-name';
import { Buffer } from 'buffer';

describe('UuidName', () => {
  it('should accept a string', () => {
    expect(UuidName.fromString('foo').asBuffer()).toStrictEqual(
      Buffer.from('foo'),
    );
  });

  it('must not accept an empty string', () => {
    expect(() => UuidName.fromString('')).toThrowError('Name cannot be empty');
  });
});
