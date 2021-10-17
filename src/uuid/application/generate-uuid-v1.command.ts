import {
  IsISO8601,
  IsMACAddress,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import MinDateString from './min-date-string.validator';
import MaxDateString from './max-date-string.validator';

interface CommandOptions {
  time?: string;
  clockSeq?: number;
  node?: string;
}

export class GenerateUuidV1Command {
  @IsOptional()
  @MinDateString('1582-10-15T00:00:00Z')
  @MaxDateString('5236-03-31T21:21:00.683Z')
  @IsISO8601()
  public readonly time: string | undefined;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0x3fff)
  public readonly clockSeq: number | undefined;
  @IsOptional()
  @IsMACAddress()
  public readonly node: string | undefined;

  constructor(options?: CommandOptions) {
    if (options?.time) {
      this.time = options.time;
    }
    if (options?.clockSeq) {
      this.clockSeq = options.clockSeq;
    }
    if (options?.node) {
      this.node = options.node;
    }
  }
}
