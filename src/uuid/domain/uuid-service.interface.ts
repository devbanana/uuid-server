import { UuidV1 } from './uuid-v1';
import { UuidTime } from './uuid-time';

export interface UuidServiceInterface {
  generate(time: UuidTime | undefined): UuidV1;
}
