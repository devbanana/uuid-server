import { Rfc4122Uuid } from './rfc4122-uuid';
import { UuidV4 } from './random/uuid-v4';

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

  it.each`
    uuid                                      | version
    ${'cb8e5b54-3c58-11ec-8a80-2f9fecb2ce5a'} | ${1}
    ${'d4970169-f9a4-31c9-a11b-08609bb119c2'} | ${3}
    ${'4a52c822-5fb6-449e-b6ab-557d7a7c04f3'} | ${4}
    ${'0cabaa1d-1c4d-5cf5-8938-b56ac03409f4'} | ${5}
  `(
    'can detect a version $version UUID',
    ({ uuid, version }: { uuid: string; version: number }) => {
      expect(Rfc4122Uuid.versionOf(uuid)).toBe(version);
    },
  );

  it('can get the version from a buffer', () => {
    expect(
      Rfc4122Uuid.versionOf(
        Buffer.from('25d235f1e1cc48699656bdd00e4507f0', 'hex'),
      ),
    ).toBe(4);
  });

  it('cannot get the version of an invalid UUID', () => {
    expect(() => Rfc4122Uuid.versionOf('foo')).toThrowError(
      'is not a valid UUID',
    );
  });

  it('can get the version from an instance', () => {
    expect(
      UuidV4.fromRfc4122('e8d5a020-a0c6-4e86-82c7-f458f049da81').version,
    ).toBe(4);
  });
});
