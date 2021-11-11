import { Md5HashProvider } from '../../src/uuid/domain/name-based/md5-hash.provider';
import { Buffer } from 'buffer';
import { RandomBytesProvider } from '../../src/uuid/domain/random-bytes.provider';
import { HashProvider } from '../../src/uuid/domain/name-based/hash.provider';
import { Sha1HashProvider } from '../../src/uuid/domain/name-based/sha1-hash.provider';
import { UuidV1Repository } from '../../src/uuid/domain/time-based/uuid-v1.repository';
import { UuidV1 } from '../../src/uuid/domain/time-based/uuid-v1';

export class FakeRandomBytesProvider extends RandomBytesProvider {
  private randomValues: Buffer[] = [];

  constructor(...data: Buffer[]) {
    super();
    this.randomValues.concat(data);
  }

  addRandomValue(data: Buffer) {
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
