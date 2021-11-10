import { UuidV5 } from './uuid-v5';
import { FakeSha1HashProvider } from '../../../../test/utils/test.fakes';
import { PredefinedNamespaces } from './predefined-namespaces';
import { UuidName } from './uuid-name';
import { UuidNamespace } from './uuid-namespace';

const uuidString = '0cabaa1d-1c4d-5cf5-8938-b56ac03409f4';

describe('UuidV5', () => {
  it('can be created from RFC4122 format', () => {
    expect(() => UuidV5.fromRfc4122(uuidString)).not.toThrowError();
  });

  it('should not accept a V3 UUID', () => {
    expect(() =>
      UuidV5.fromRfc4122('d4970169-f9a4-31c9-a11b-08609bb119c2'),
    ).toThrowError('is not a V5 UUID');
  });

  it('can be created from namespace and name', async () => {
    // noinspection SpellCheckingInspection
    const sha1HashProvider = new FakeSha1HashProvider(
      Buffer.from('0cabaa1d1c4dacf54938b56ac03409f429b1076e', 'hex'),
    );
    const spy = jest.spyOn(sha1HashProvider, 'hash');

    const uuid = await UuidV5.create(
      UuidNamespace.fromPredefined(PredefinedNamespaces.Dns),
      UuidName.fromString('devbanana.me'),
      sha1HashProvider,
    );

    expect(uuid.asRfc4122()).toBe(uuidString);
    expect(uuid.version).toBe(5);
    expect(spy).toBeCalledWith(
      Buffer.from(
        '6ba7b8109dad11d180b400c04fd430c864657662616e616e612e6d65',
        'hex',
      ),
    );
  });

  it('can be validated', () => {
    expect(UuidV5.isValid('d4970169-f9a4-31c9-a11b-08609bb119c2')).toBeFalsy();
    expect(UuidV5.isValid(uuidString)).toBeTruthy();
  });
});
