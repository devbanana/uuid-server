export const gregorianStart = -12_219_292_800_000;

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

    return new UuidTime(date);
  }

  asMilliseconds(): number {
    return this.time.getTime();
  }
}
