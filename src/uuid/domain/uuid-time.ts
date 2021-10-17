// 1582-10-15T00:00:00Z
export const gregorianStart = -12_219_292_800_000;

// 5236-03-31T21:21:00.683Z
// Technically there is enough room for 684 ms, but then it would overflow before ns intervals
// reached 10,000. Therefore 683 is the greatest number of ms that cannot overflow.
export const maxMs = 103_072_857_660_683;

export class UuidTime {
  private constructor(private time: Date) {}

  static fromString(time: string): UuidTime {
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      throw new Error('time must be a valid date string');
    }

    if (date.getTime() < gregorianStart) {
      throw new Error('time cannot be before 1582-10-15 at 00:00:00 UTC');
    }

    if (date.getTime() > maxMs) {
      throw new Error('time cannot be after 5236-03-31 at 21:21:00.683 UTC');
    }

    return new UuidTime(date);
  }

  asMilliseconds(): number {
    return this.time.getTime();
  }
}
