export class ClockSequence {
  private constructor(private readonly clockSeq: number) {}

  static fromNumber(clockSeq: number): ClockSequence {
    if (clockSeq < 0) {
      throw new Error('Clock sequence cannot be negative');
    }

    if (clockSeq > 0x3fff) {
      throw new Error('Clock sequence cannot be greater than 0x3FFF');
    }

    return new ClockSequence(clockSeq);
  }

  asNumber(): number {
    return this.clockSeq;
  }
}
