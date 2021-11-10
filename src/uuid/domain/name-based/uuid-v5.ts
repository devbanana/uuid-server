import { Rfc4122Uuid } from '../rfc4122-uuid';
import { Sha1HashProvider } from './sha1-hash.provider';
import { Buffer } from 'buffer';
import { UuidNamespace } from './uuid-namespace';
import { UuidName } from './uuid-name';

export class UuidV5 extends Rfc4122Uuid {
  static version = 5;

  static async create(
    namespace: UuidNamespace,
    name: UuidName,
    sha1HashProvider: Sha1HashProvider,
  ): Promise<UuidV5> {
    const data = Buffer.concat([namespace.asBuffer(), name.asBuffer()]);
    const hash = await sha1HashProvider
      .hash(data)
      .then(buffer => buffer.subarray(0, 16));

    this.setVersion(hash, 5);
    this.setVariant(hash);

    return this.fromBuffer(hash);
  }
}
