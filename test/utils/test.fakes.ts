import { Md5HashProvider } from '../../src/uuid/domain/name-based/md5-hash.provider';
import { Buffer } from 'buffer';
import { RandomBytesProvider } from '../../src/uuid/domain/random-bytes.provider';
import { HashProvider } from '../../src/uuid/domain/name-based/hash.provider';
import { Sha1HashProvider } from '../../src/uuid/domain/name-based/sha1-hash.provider';

export class FakeRandomBytesProvider extends RandomBytesProvider {
  constructor(private data?: Buffer) {
    super();
  }

  set bytes(data: Buffer) {
    this.data = data;
  }

  generate(_bytes: number): Promise<Buffer> {
    if (this.data === undefined) throw new Error('Random bytes not set');

    return Promise.resolve(this.data);
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
