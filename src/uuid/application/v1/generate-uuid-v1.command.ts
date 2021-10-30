import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsMACAddress,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import MinDateString from '../min-date-string.validator';
import MaxDateString from '../max-date-string.validator';
import { Type } from 'class-transformer';
import { UuidFormats } from '../../domain/uuid-formats';
import { GenerateUuidV1CommandOptions } from './generate-uuid-v1.command.options';

export class GenerateUuidV1Command {
  /**
   * The time to be used for the timestamp field of this UUID.
   *
   * Must be in ISO8601 format.
   *
   * May optionally include a timezone if appended at the end of the timestamp, otherwise UTC is
   * assumed.
   *
   * Default: the current time of the request
   *
   * @example 2021-10-29T07:25:33-0400
   */
  @IsOptional()
  @MinDateString('1582-10-15T00:00:00Z')
  @MaxDateString('5236-03-31T21:21:00.683Z')
  @IsISO8601()
  public readonly time?: string;

  /**
   * The value to be used for the clockseq field.
   *
   * May be any number between 0 and 16,383 (0x3fff).
   *
   * Generated randomly if not provided.
   *
   * @example 954
   */
  @IsOptional()
  @Min(0)
  @Max(0x3fff)
  @IsInt()
  @Type(() => Number)
  public readonly clockSeq?: number;

  /**
   * The MAC address to be used for the node field.
   *
   * Must be any validly-formatted 48-bit MAC address.
   *
   * Generated randomly if not provided.
   *
   * @example F5:0D:A2:94:3C:14
   */
  @IsOptional()
  @IsMACAddress()
  public readonly node?: string;

  /**
   * The format in which to provide the generated UUID.
   */
  @IsOptional()
  @IsEnum(UuidFormats, { message: 'An invalid format was provided' })
  public readonly format?: UuidFormats = UuidFormats.Rfc4122;

  constructor(options?: GenerateUuidV1CommandOptions) {
    if (options?.time !== undefined) {
      this.time = options.time;
    }
    if (options?.clockSeq !== undefined) {
      this.clockSeq = options.clockSeq;
    }
    if (options?.node !== undefined) {
      this.node = options.node;
    }
    if (options?.format !== undefined) {
      this.format = options.format;
    }
  }
}
