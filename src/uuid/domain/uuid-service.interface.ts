import { UuidV1 } from './v1/uuid-v1';
import { UuidTime } from './v1/uuid-time';
import { ClockSequence } from './v1/clock-sequence';
import { Node } from './v1/node';

export interface UuidServiceInterface {
  generate(time?: UuidTime, clockSeq?: ClockSequence, node?: Node): UuidV1;
}
