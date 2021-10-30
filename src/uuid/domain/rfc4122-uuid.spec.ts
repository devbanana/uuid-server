import { Rfc4122Uuid } from './rfc4122-uuid';

describe('Rfc4122Uuid', () => {
  it('cannot be validated directly', () => {
    // noinspection SpellCheckingInspection
    expect(() =>
      Rfc4122Uuid.isValid(
        Buffer.from('feabe580399511eca11167ef5010decf', 'hex'),
      ),
    ).toThrowError('Version must be defined');
  });

  it('detects when version is not available', () => {
    const uuidClass = class extends Rfc4122Uuid {
      protected static isCorrectVersion(_uuid: Buffer): boolean {
        return false;
      }
    };

    expect(() =>
      uuidClass.fromRfc4122('e0455f58-3996-11ec-b792-9fa4b1761051'),
    ).toThrowError('UUID is not a valid RFC4122 UUID');
  });
});
