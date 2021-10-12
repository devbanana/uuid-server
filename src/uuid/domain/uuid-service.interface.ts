import { UuidV1 } from './uuid-v1';

export interface UuidServiceInterface {
  generate(time: string | undefined): UuidV1;
}
