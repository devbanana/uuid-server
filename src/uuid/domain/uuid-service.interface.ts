import { UuidV1 } from './time-based/uuid-v1';
import { UuidTime } from './time-based/uuid-time';
import { ClockSequence } from './time-based/clock-sequence';
import { Node } from './time-based/node';

export interface UuidServiceInterface {
  generateV1(time?: UuidTime, clockSeq?: ClockSequence, node?: Node): UuidV1;
}
