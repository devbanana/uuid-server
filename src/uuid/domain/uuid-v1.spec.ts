import { UuidV1 } from './uuid-v1';

describe('UuidV1', () => {
  const uuid = 'ced717a0-2ab6-11ec-bce4-bf507cc82961';
  let uuidV1: UuidV1;

  beforeEach(() => {
    uuidV1 = UuidV1.fromUuid(uuid);
  });

  it('should be defined', () => {
    expect(uuidV1).toBeDefined();
  });

  it('should get the UUID as a string', () => {
    expect(uuidV1.asString()).toBe(uuid);
  });

  it("should extract the UUID's time", () => {
    expect(uuidV1.getTime()).toStrictEqual(
      new Date('2021-10-11T17:15:18.426Z'),
    );
  });
});
