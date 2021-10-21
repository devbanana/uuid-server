import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsMACAddress,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import MinDateString from './min-date-string.validator';
import MaxDateString from './max-date-string.validator';
import { Type } from 'class-transformer';

export enum UuidFormats {
  Rfc4122 = 'rfc4122',
  Base32 = 'base32',
}

interface CommandOptions {
  time?: string;
  clockSeq?: number;
  node?: string;
  format?: UuidFormats;
}

export class GenerateUuidV1Command {
  @IsOptional()
  @MinDateString('1582-10-15T00:00:00Z')
  @MaxDateString('5236-03-31T21:21:00.683Z')
  @IsISO8601()
  public readonly time: string | undefined;

  @IsOptional()
  @Min(0)
  @Max(0x3fff)
  @IsInt()
  @Type(() => Number)
  public readonly clockSeq: number | undefined;

  @IsOptional()
  @IsMACAddress()
  public readonly node: string | undefined;

  @IsOptional()
  @IsEnum(UuidFormats, { message: 'An invalid format was provided' })
  public readonly format: UuidFormats | undefined;

  constructor(options?: CommandOptions) {
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
