import { UuidTime } from './uuid-time';

describe('UuidTime', () => {
  it('should be defined', () => {
    expect(UuidTime.fromString('2021-10-12T01:40:45Z')).toBeDefined();
  });

  it('should accept a valid time', () => {
    const time = UuidTime.fromString('2021-10-12T00:00:00Z');
    expect(time.asMilliseconds()).toBe(1_633_996_800_000);
  });

  it('should not accept an invalid time', () => {
    expect(() => UuidTime.fromString('foo')).toThrowError(
      /time must be a valid date string/,
    );
  });
});
