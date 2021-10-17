import { gregorianStart, UuidTime } from './uuid-time';

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

  it('cannot be prior to 1582-10-15', () => {
    expect(() => UuidTime.fromString('1582-10-14T23:59:59Z')).toThrowError(
      /time cannot be before/,
    );
  });

  it('can be exactly 1582-10-15 at midnight UTC', () => {
    expect(UuidTime.fromString('1582-10-15T00:00:00Z').asMilliseconds()).toBe(
      gregorianStart,
    );
  });

  it('cannot be later than 5236-03-31 at 21:21:00.683 UTC', () => {
    expect(() => UuidTime.fromString('5236-03-31T21:21:00.684Z')).toThrowError(
      /time cannot be after/,
    );
  });

  it('can be exactly 5236-03-31 at 21:21:00.683 UTC', () => {
    expect(() =>
      UuidTime.fromString('5236-03-31T21:21:00.683Z').asMilliseconds(),
    ).not.toThrowError();
  });
});
