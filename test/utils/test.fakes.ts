import { Md5HashProvider } from '../../src/uuid/domain/name-based/md5-hash.provider';
import { Buffer } from 'buffer';
import { RandomBytesProvider } from '../../src/uuid/domain/random-bytes.provider';
import { HashProvider } from '../../src/uuid/domain/name-based/hash.provider';
import { Sha1HashProvider } from '../../src/uuid/domain/name-based/sha1-hash.provider';
import { UuidV1Repository } from '../../src/uuid/domain/time-based/uuid-v1.repository';
import { UuidV1 } from '../../src/uuid/domain/time-based/uuid-v1';
import { Clock } from '../../src/uuid/domain/time-based/clock';
import { Node } from '../../src/uuid/domain/time-based/node';
import { UuidTime } from '../../src/uuid/domain/time-based/uuid-time';

export class FakeRandomBytesProvider extends RandomBytesProvider {
  private randomValues: Buffer[];

  constructor(...data: Buffer[]) {
    super();
    this.randomValues = data;
  }

  addRandomValue(data: Buffer): void {
    this.randomValues.push(data);
  }

  generate(_bytes: number): Promise<Buffer> {
    if (this.randomValues.length === 0) throw new Error('Random bytes not set');

    return Promise.resolve(this.randomValues.shift()!);
  }
}

abstract class FakeHashProvider implements HashProvider {
  constructor(protected buffer: Buffer) {}

  set data(data: Buffer) {
    this.buffer = data;
  }

  hash(_data: Buffer): Promise<Buffer> {
    return Promise.resolve(this.buffer);
  }
}

export class FakeMd5HashProvider
  extends FakeHashProvider
  implements Md5HashProvider {}

export class FakeSha1HashProvider
  extends FakeHashProvider
  implements Sha1HashProvider {}

export class FakeUuidV1Repository implements UuidV1Repository {
  private readonly uuids: UuidV1[] = [];
  private readonly lastUuid: Map<number, UuidV1> = new Map();

  save(uuid: UuidV1): Promise<void> {
    this.uuids.push(uuid);
    this.lastUuid.set(uuid.node.asNumber(), uuid);

    return Promise.resolve(undefined);
  }

  countUuidsByNode(node: Node): Promise<number> {
    return Promise.resolve(
      this.uuids.reduce((count, uuid) => {
        if (node.asNumber() === uuid.node.asNumber()) {
          count++;
        }

        return count;
      }, 0),
    );
  }

  getLastUuidByTimeAndNode(
    time: UuidTime,
    node: Node,
  ): Promise<UuidV1 | undefined> {
    const uuids = this.uuids.filter(
      uuid =>
        uuid.node.asNumber() === node.asNumber() && uuid.time.ms === time.ms,
    );

    return Promise.resolve(uuids.pop());
  }

  getLastCreatedUuidByNode(node: Node): Promise<UuidV1 | undefined> {
    return Promise.resolve(this.lastUuid.get(node.asNumber()));
  }
}

export class FakeClock implements Clock {
  private timestamp = 0;

  set time(time: number) {
    this.timestamp = time;
  }

  now(): number {
    return this.timestamp;
  }
}
