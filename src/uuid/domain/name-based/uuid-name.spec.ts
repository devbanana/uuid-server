import { UuidName } from './uuid-name';
import { Buffer } from 'buffer';

describe('UuidName', () => {
  it('should accept a string', () => {
    expect(UuidName.fromString('foo').asBuffer()).toStrictEqual(
      Buffer.from('foo'),
    );
  });
});
