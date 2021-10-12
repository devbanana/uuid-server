export class UuidTime {
  private constructor(private time: Date) {}

  static fromString(time: string): UuidTime {
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      throw new Error('time must be a valid date string');
    }

    return new UuidTime(date);
  }

  asMilliseconds(): number {
    return this.time.getTime();
  }
}
