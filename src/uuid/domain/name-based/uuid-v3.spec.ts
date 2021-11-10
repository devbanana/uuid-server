import { UuidV3 } from './uuid-v3';
import { UuidNamespace } from './uuid-namespace';
import { PredefinedNamespaces } from './predefined-namespaces';
import { FakeMd5HashProvider } from '../../../../test/utils/test.fakes';
import { UuidName } from './uuid-name';

const uuidString = 'd4970169-f9a4-31c9-a11b-08609bb119c2';

describe('UuidV3', () => {
  it('can be created from RFC4122 format', () => {
    expect(() => UuidV3.fromRfc4122(uuidString)).not.toThrowError();
  });

  it('will reject a V1 UUID', () => {
    expect(() =>
      UuidV3.fromRfc4122('b8ff081a-3994-11ec-aefe-bb4840f28b12'),
    ).toThrowError('is not a V3 UUID');
  });

  it('can be created from namespace and name', async () => {
    const md5HashProvider = new FakeMd5HashProvider(
      Buffer.from('d4970169f9a4c1c9611b08609bb119c2', 'hex'),
    );
    const spy = jest.spyOn(md5HashProvider, 'hash');

    const uuid: UuidV3 = await UuidV3.create(
      UuidNamespace.fromPredefined(PredefinedNamespaces.Dns),
      UuidName.fromString('devbanana.me'),
      md5HashProvider,
    );

    expect(uuid.asRfc4122()).toBe(uuidString);
    expect(uuid.version).toBe(3);
    expect(spy).toHaveBeenCalledWith(
      Buffer.from(
        '6ba7b8109dad11d180b400c04fd430c864657662616e616e612e6d65',
        'hex',
      ),
    );
  });

  it('can be validated', () => {
    expect(UuidV3.isValid('0cabaa1d-1c4d-5cf5-8938-b56ac03409f4')).toBeFalsy();
    expect(UuidV3.isValid(uuidString)).toBeTruthy();
  });
});
