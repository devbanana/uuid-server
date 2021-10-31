import { UuidV3 } from './uuid-v3';

// noinspection SpellCheckingInspection
const uuid = Buffer.from('1dbfc9ac4546358caa6e37e8499ec948', 'hex');
const uuidV3 = UuidV3.fromBuffer(uuid);

describe('UuidV3', () => {
  it('should be defined', () => {
    expect(uuidV3).toBeDefined();
  });

  it('can be created from RFC4122 format', () => {
    expect(
      UuidV3.fromRfc4122('1dbfc9ac-4546-358c-aa6e-37e8499ec948').asBuffer(),
    ).toStrictEqual(uuid);
  });

  it('will reject a V1 UUID', () => {
    expect(() =>
      UuidV3.fromRfc4122('b8ff081a-3994-11ec-aefe-bb4840f28b12'),
    ).toThrowError('is not a V3 UUID');
  });
});
