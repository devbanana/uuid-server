import { UuidSchema } from './uuid.schema';

export interface Rfc4122UuidSchema extends UuidSchema {
  type: 'rfc4122';
  version: 1 | 3 | 4 | 5;
}
