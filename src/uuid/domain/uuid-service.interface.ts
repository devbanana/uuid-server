import { UuidV1 } from './time-based/uuid-v1';
import { UuidTime } from './time-based/uuid-time';
import { ClockSequence } from './time-based/clock-sequence';
import { Node } from './time-based/node';
import { UuidV3 } from './name-based/uuid-v3';
import { UuidV5 } from './name-based/uuid-v5';
import { UuidNamespace } from './name-based/uuid-namespace';
import { UuidName } from './name-based/uuid-name';
import { UuidV4 } from './random/uuid-v4';

export interface UuidServiceInterface {
  generateV1(time?: UuidTime, clockSeq?: ClockSequence, node?: Node): UuidV1;

  generateV3(namespace: UuidNamespace, name: UuidName): Promise<UuidV3>;

  generateV4(): Promise<UuidV4>;

  generateV5(namespace: UuidNamespace, name: UuidName): Promise<UuidV5>;
}
