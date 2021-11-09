import { Rfc4122Uuid } from '../rfc4122-uuid';
import { RandomBytesProvider } from '../random-bytes.provider';

export class UuidV4 extends Rfc4122Uuid {
  static version = 4;

  static async create(
    randomBytesProvider: RandomBytesProvider,
  ): Promise<UuidV4> {
    const bytes = await randomBytesProvider.generate(16);
    this.setVersion(bytes, 4);
    this.setVariant(bytes);

    return this.fromBuffer(bytes);
  }
}
