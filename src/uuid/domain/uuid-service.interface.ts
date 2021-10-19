import { UuidV1 } from './uuid-v1';
import { UuidTime } from './uuid-time';
import { ClockSequence } from './clock-sequence';
import { Node } from './node';

export interface UuidServiceInterface {
  generate(time?: UuidTime, clockSeq?: ClockSequence, node?: Node): UuidV1;
}
