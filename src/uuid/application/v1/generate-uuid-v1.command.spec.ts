import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { plainToClass } from 'class-transformer';
import { UuidFormats } from '../../domain/uuid-formats';

describe('GenerateUuidV1Command', () => {
  it('should be defined', () => {
    expect(new GenerateUuidV1Command()).toBeDefined();
  });

  it('should require time to be a valid date', async () => {
    await expect(
      new GenerateUuidV1Command({ time: 'foo' }),
    ).toHaveValidationConstraint('isIso8601', 'time');
  });

  it('should require time to not be before 1582-10-15 at midnight UTC', async () => {
    await expect(
      new GenerateUuidV1Command({ time: '1582-10-14T23:59:59Z' }),
    ).toHaveValidationConstraint('minDateString', 'time');
  });

  it('should allow time to be exactly 1582-10-15 at midnight UTC', async () => {
    await expect(
      new GenerateUuidV1Command({ time: '1582-10-15T00:00:00Z' }),
    ).not.toHaveValidationErrorsOn('time');
  });

  it('should not allow time to be an empty string', async () => {
    await expect(
      new GenerateUuidV1Command({ time: '' }),
    ).toHaveValidationConstraint('isIso8601', 'time');
  });

  it('should require time to not be after 5236-03-31 at 21:21:00.684 UTC', async () => {
    await expect(
      new GenerateUuidV1Command({
        time: '5236-03-31T21:21:00.684Z',
      }),
    ).toHaveValidationConstraint('maxDateString', 'time');
  });

  it('should allow time to be exactly 5236-03-31 at 21:21:00.683 UTC', async () => {
    await expect(
      new GenerateUuidV1Command({
        time: '5236-03-31T21:21:00.683Z',
      }),
    ).not.toHaveValidationErrorsOn('time');
  });

  it('should require clockSeq to be at least 0', async () => {
    await expect(
      new GenerateUuidV1Command({ clockSeq: -3 }),
    ).toHaveValidationConstraint('min', 'clockSeq');
  });

  it('should require clockSeq to not be greater than 0x3fff', async () => {
    await expect(
      new GenerateUuidV1Command({ clockSeq: 0x4000 }),
    ).toHaveValidationConstraint('max', 'clockSeq');
  });

  it('should not allow a decimal to be passed for clockSeq', async () => {
    await expect(
      new GenerateUuidV1Command({ clockSeq: 3.8 }),
    ).toHaveValidationConstraint('isInt', 'clockSeq');
  });

  it('should allow a numeric string to be passed for clockSeq', async () => {
    const command = plainToClass(GenerateUuidV1Command, { clockSeq: '16230' });
    await expect(command).not.toHaveValidationErrorsOn('clockSeq');
    expect(command.clockSeq).toBe(16_230);
  });

  it('should allow clockSeq to be 0', async () => {
    const command = new GenerateUuidV1Command({ clockSeq: 0 });
    await expect(command).not.toHaveValidationErrorsOn('clockSeq');
    expect(command.clockSeq).toBe(0);
  });

  describe('the node', () => {
    it.each([
      ['should accept colons', '92:5F:CF:BE:F9:98'],
      ['should accept hyphens', '18-94-94-EA-95-53'],
      ['should accept dots', 'CFF4.94C8.C0EA'],
      ['should accept a lowercase address', 'a3:9b:b5:0a:80:26'],
    ])('%s', async (description, mac) => {
      await expect(
        new GenerateUuidV1Command({ node: mac }),
      ).not.toHaveValidationErrorsOn('node');
    });

    it('should not accept non-hexadecimal values', async () => {
      await expect(
        new GenerateUuidV1Command({ node: '35:07:CZ:17:6C:E7' }),
      ).toHaveValidationConstraint('isMacAddress', 'node');
    });

    it('cannot be an empty string', async () => {
      await expect(
        new GenerateUuidV1Command({ node: '' }),
      ).toHaveValidationConstraint('isMacAddress', 'node');
    });
  });

  describe('the format', () => {
    it.each`
      format
      ${'rfc4122'}
      ${'base32'}
      ${'base58'}
      ${'base64'}
      ${'binary'}
      ${'number'}
    `('can be $format', async ({ format }: { format: UuidFormats }) => {
      await expect(
        plainToClass(GenerateUuidV1Command, { format }),
      ).not.toHaveValidationErrorsOn('format');
    });

    it('cannot be an invalid format', async () => {
      await expect(
        plainToClass(GenerateUuidV1Command, { format: 'foo' }),
      ).toHaveValidationConstraint('isEnum', 'format');
    });

    it('is set in the constructor', () => {
      const command = new GenerateUuidV1Command({
        format: UuidFormats.Rfc4122,
      });

      expect(command.format).toBe(UuidFormats.Rfc4122);
    });
  });
});
