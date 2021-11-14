import { Rfc4122UuidSchema } from './rfc4122-uuid.schema';

export interface UuidV1Schema extends Rfc4122UuidSchema {
  version: 1;
  date: Date;
  nsOffset: number;
  clockSequence: number;
  node: number;
}
