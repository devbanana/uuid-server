import { UuidFormats } from '../../domain/uuid-formats';

export interface GenerateUuidV1CommandOptions {
  time?: string;
  clockSeq?: number;
  node?: string;
  format?: UuidFormats;
}
