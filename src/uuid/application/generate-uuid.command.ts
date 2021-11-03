import { IsEnum, IsOptional } from 'class-validator';
import { UuidFormats } from '../domain/uuid-formats';

export class GenerateUuidCommand {
  /**
   * The format in which to provide the generated UUID.
   */
  @IsOptional()
  @IsEnum(UuidFormats, { message: 'An invalid format was provided' })
  public readonly format?: UuidFormats = UuidFormats.Rfc4122;

  constructor(format?: UuidFormats) {
    if (format !== undefined) {
      this.format = format;
    }
  }
}
