import { gregorianStart, maxMs, UuidTime } from './uuid-time';

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

  it('can accept milliseconds', () => {
    expect(UuidTime.fromMilliseconds(1_634_451_225_740).asMilliseconds()).toBe(
      1_634_451_225_740,
    );
  });

  it('can include nanoseconds', () => {
    const time = UuidTime.fromMilliseconds(
      1000 * 60 * 60 * 24,
    ).withAddedNanoseconds(100);

    expect(time.asNanosecondsSinceGregorianStart()).toBe(
      86_400_000_000_100n - BigInt(gregorianStart) * 1_000_000n,
    );
  });

  it('must be in 100 nanosecond intervals', () => {
    expect(() =>
      UuidTime.fromMilliseconds(1000 * 60 * 60 * 24).withAddedNanoseconds(99),
    ).toThrowError('Nanoseconds must be a multiple of 100');
  });

  it('cannot have nanoseconds greater than 1,000,000', () => {
    expect(() =>
      UuidTime.fromMilliseconds(1000 * 60 * 60 * 24).withAddedNanoseconds(
        1000000000,
      ),
    ).toThrowError('Nanoseconds must be less than 1,000,000');
  });

  it('cannot accept nanoseconds less than 0', () => {
    expect(() =>
      UuidTime.fromMilliseconds(1000 * 60 * 60 * 24).withAddedNanoseconds(-100),
    ).toThrowError('Nanoseconds cannot be negative');
  });

  it('can be converted to nanoseconds since gregorian start', () => {
    expect(
      UuidTime.fromMilliseconds(
        1000 * 60 * 60 * 24 * 365,
      ).asNanosecondsSinceGregorianStart(),
    ).toBe(12_250_828_800_000_000_000n);
  });

  it('can get the nanoseconds component', () => {
    expect(
      UuidTime.fromMilliseconds(1000 * 60 * 60 * 24).withAddedNanoseconds(500)
        .ns,
    ).toBe(500);
  });

  describe.each`
    type              | minDate                   | maxDate
    ${'date string'}  | ${'1582-10-15T00:00:00Z'} | ${'5236-03-31T21:21:00.683Z'}
    ${'milliseconds'} | ${gregorianStart}         | ${maxMs}
  `(
    'using $type',
    ({
      minDate,
      maxDate,
    }: {
      minDate: string | number;
      maxDate: string | number;
    }) => {
      it('cannot be prior to 1582-10-15 at midnight UTC', () => {
        expect(() => {
          if (typeof minDate === 'string') {
            const date = new Date(minDate).getTime() - 1;

            return UuidTime.fromString(new Date(date).toISOString());
          }

          return UuidTime.fromMilliseconds(minDate - 1);
        }).toThrowError(/time cannot be before/);
      });

      it('can be exactly 1582-10-15 at midnight UTC', () => {
        expect(() =>
          typeof minDate === 'string'
            ? UuidTime.fromString(minDate)
            : UuidTime.fromMilliseconds(minDate),
        ).not.toThrowError();
      });

      it('cannot be later than 5236-03-31 at 21:21:00.683 UTC', () => {
        expect(() => {
          if (typeof maxDate === 'string') {
            const date = new Date(maxDate).getTime() + 1;

            return UuidTime.fromString(new Date(date).toISOString());
          }

          return UuidTime.fromMilliseconds(maxDate + 1);
        }).toThrowError(/time cannot be after/);
      });

      it('can be exactly 5236-03-31 at 21:21:00.683 UTC', () => {
        expect(() =>
          typeof maxDate === 'string'
            ? UuidTime.fromString(maxDate)
            : UuidTime.fromMilliseconds(maxDate),
        ).not.toThrowError();
      });
    },
  );
});
