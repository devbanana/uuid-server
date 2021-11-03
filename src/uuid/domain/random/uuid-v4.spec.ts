import { UuidV4 } from './uuid-v4';

describe('UuidV4', () => {
  // noinspection SpellCheckingInspection
  const uuid = Buffer.from('dcc3880cd5cd41e1baee79d697ae3ebf', 'hex');
  const uuidV4 = UuidV4.fromBuffer(uuid);

  it('should be defined', () => {
    expect(uuidV4).toBeDefined();
  });

  it('can be created from RFC4122', () => {
    expect(
      UuidV4.fromRfc4122('dcc3880c-d5cd-41e1-baee-79d697ae3ebf').asBuffer(),
    ).toStrictEqual(uuid);
  });

  it('must not accept a V5 UUID', () => {
    expect(() =>
      UuidV4.fromRfc4122('0cabaa1d-1c4d-5cf5-8938-b56ac03409f4'),
    ).toThrowError('is not a V4 UUID');
  });

  it('can validate a V4 UUID', () => {
    expect(UuidV4.isValid('3a457c19-cd70-4b38-9d78-5d3ae346ba1e')).toBeTruthy();
    expect(UuidV4.isValid('18f6a084-3cab-11ec-bf35-736940a9abc7')).toBeFalsy();
  });
});
