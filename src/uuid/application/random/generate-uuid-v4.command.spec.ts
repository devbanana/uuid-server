import { GenerateUuidV4Command } from './generate-uuid-v4.command';
import { UuidFormats } from '../../domain/uuid-formats';
import { plainToClass } from 'class-transformer';

describe('GenerateUuidV4Command', () => {
  it('is defined', () => {
    expect(new GenerateUuidV4Command()).toBeDefined();
  });

  it('can accept a format', async () => {
    await expect(
      new GenerateUuidV4Command(UuidFormats.Base32),
    ).not.toHaveValidationErrors();
  });

  it('does not require a format', async () => {
    await expect(new GenerateUuidV4Command()).not.toHaveValidationErrors();
  });

  it('requires a valid format', async () => {
    await expect(
      plainToClass(GenerateUuidV4Command, { format: 'foo' }),
    ).toHaveValidationErrorsOn('format');
  });
});
