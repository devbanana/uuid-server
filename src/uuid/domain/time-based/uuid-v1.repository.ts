import { UuidTime } from './uuid-time';
import { Node } from './node';
import { UuidV1 } from './uuid-v1';

export abstract class UuidV1Repository {
  abstract countUuidsByNode(node: Node): Promise<number>;

  abstract getLastUuidByTimeAndNode(
    time: UuidTime,
    node: Node,
  ): Promise<UuidV1 | undefined>;

  abstract getLastCreatedUuidByNode(node: Node): Promise<UuidV1 | undefined>;

  abstract save(uuid: UuidV1): Promise<void>;
}
