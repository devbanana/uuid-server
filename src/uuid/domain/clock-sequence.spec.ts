import { ClockSequence } from './clock-sequence';

describe('ClockSequence', () => {
  it('should be defined', () => {
    expect(ClockSequence.fromNumber(9_504)).toBeDefined();
  });

  it('can be converted into a number', () => {
    expect(ClockSequence.fromNumber(15_199).asNumber()).toBe(15_199);
  });

  it('should not accept a negative number', () => {
    expect(() => ClockSequence.fromNumber(-10)).toThrowError(
      /Clock sequence cannot be negative/,
    );
  });

  it('should not accept a number over 0x3FFF', () => {
    expect(() => ClockSequence.fromNumber(0x4000)).toThrowError(
      /Clock sequence cannot be greater than 0x3FFF/,
    );
  });
});
