import { Rfc4122Uuid } from '../rfc4122-uuid';
import { UuidNamespace } from './uuid-namespace';
import { UuidName } from './uuid-name';
import { Md5HashProvider } from './md5-hash.provider';
import { Buffer } from 'buffer';

export class UuidV3 extends Rfc4122Uuid {
  static version = 3;

  static async create(
    namespace: UuidNamespace,
    name: UuidName,
    md5HashProvider: Md5HashProvider,
  ): Promise<UuidV3> {
    const buffer = Buffer.concat([namespace.asBuffer(), name.asBuffer()]);
    const hash = await md5HashProvider.hash(buffer);

    this.setVersion(hash, 3);
    this.setVariant(hash);

    return this.fromBuffer(hash);
  }
}
