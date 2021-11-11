// 1582-10-15T00:00:00Z
export const gregorianStart = -12_219_292_800_000;

// 5236-03-31T21:21:00.683Z
// Technically there is enough room for 684 ms, but then it would overflow before ns intervals
// reached 10,000. Therefore 683 is the greatest number of ms that cannot overflow.
export const maxMs = 103_072_857_660_683;

export class UuidTime {
  private constructor(
    private readonly time: Date,
    private readonly nanoseconds: number = 0,
  ) {
    if (isNaN(time.getTime())) {
      throw new Error('time must be a valid date string');
    }

    if (time.getTime() < gregorianStart) {
      throw new Error('time cannot be before 1582-10-15 at 00:00:00 UTC');
    }

    if (time.getTime() > maxMs) {
      throw new Error('time cannot be after 5236-03-31 at 21:21:00.683 UTC');
    }

    if (nanoseconds >= 1_000_000) {
      throw new Error('Nanoseconds must be less than 1,000,000');
    }

    if (nanoseconds < 0) {
      throw new Error('Nanoseconds cannot be negative');
    }

    if (nanoseconds % 100 !== 0) {
      throw new Error('Nanoseconds must be a multiple of 100');
    }
  }

  static fromString(time: string): UuidTime {
    return new UuidTime(new Date(time));
  }

  static fromMilliseconds(ms: number): UuidTime {
    return new UuidTime(new Date(ms));
  }

  withAddedNanoseconds(ns: number): UuidTime {
    return new UuidTime(this.time, ns);
  }

  asMilliseconds(): number {
    return this.time.getTime();
  }

  asNanosecondsSinceGregorianStart(): bigint {
    return (
      (BigInt(this.asMilliseconds()) - BigInt(gregorianStart)) * 1_000_000n +
      BigInt(this.nanoseconds)
    );
  }

  get ns(): number {
    return this.nanoseconds;
  }
}
