import { UuidV5 } from './uuid-v5';

const uuidV5 = UuidV5.fromRfc4122('0cabaa1d-1c4d-5cf5-8938-b56ac03409f4');

describe('UuidV5', () => {
  it('should be defined', () => {
    expect(uuidV5).toBeDefined();
  });

  it('should not accept a V3 UUID', () => {
    expect(() =>
      UuidV5.fromRfc4122('d4970169-f9a4-31c9-a11b-08609bb119c2'),
    ).toThrowError('is' + ' not a V5 UUID');
  });
});
