import { UuidV1 } from './v1/uuid-v1';
import { UuidTime } from './v1/uuid-time';
import { ClockSequence } from './v1/clock-sequence';
import { Node } from './v1/node';
import { UuidV3 } from './name-based/uuid-v3';
import { UuidV5 } from './name-based/uuid-v5';
import { UuidNamespace } from './name-based/uuid-namespace';
import { UuidName } from './name-based/uuid-name';

export interface UuidServiceInterface {
  generateV1(time?: UuidTime, clockSeq?: ClockSequence, node?: Node): UuidV1;
  generateV3(name: UuidName, namespace: UuidNamespace): Promise<UuidV3>;
  generateV5(name: UuidName, namespace: UuidNamespace): Promise<UuidV5>;
}
