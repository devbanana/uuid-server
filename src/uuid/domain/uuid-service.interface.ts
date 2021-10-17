import { UuidV1 } from './uuid-v1';
import { UuidTime } from './uuid-time';
import { ClockSequence } from './clock-sequence';

export interface UuidServiceInterface {
  generate(time?: UuidTime, clockSeq?: ClockSequence): UuidV1;
}
