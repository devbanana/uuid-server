import { Rfc4122UuidSchema } from './rfc4122-uuid.schema';

export interface UuidV4Schema extends Rfc4122UuidSchema {
  version: 4;
}
