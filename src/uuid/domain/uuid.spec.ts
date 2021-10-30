import { Uuid } from './uuid';

describe('Uuid', () => {
  it('can be validated', () => {
    expect(
      Uuid.isValid(Buffer.from('e5cb4c59f8bc433894e2f40e0fb99b07', 'hex')),
    ).toBeTruthy();
  });

  it('can detect an invalid UUID', () => {
    expect(Uuid.isValid(Buffer.from('foo'))).toBeFalsy();
  });

  it('is valid by default', () => {
    // A UUID only needs 128 bits
    const uuidWithNoRequirements = class extends Uuid {};

    // noinspection SpellCheckingInspection
    expect(() =>
      uuidWithNoRequirements.fromBuffer(Buffer.from('ABCDEFGHIJKLMNOP')),
    ).not.toThrowError();
  });
});
