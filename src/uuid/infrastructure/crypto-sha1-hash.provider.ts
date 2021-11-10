import { CryptoHashProvider } from './crypto-hash.provider';
import { Sha1HashProvider } from '../domain/name-based/sha1-hash.provider';
import { Buffer } from 'buffer';

export class CryptoSha1HashProvider
  extends CryptoHashProvider
  implements Sha1HashProvider
{
  hash(data: Buffer): Promise<Buffer> {
    return this.createHash('sha1', data);
  }
}
