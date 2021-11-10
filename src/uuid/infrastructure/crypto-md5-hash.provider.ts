import { Buffer } from 'buffer';
import { CryptoHashProvider } from './crypto-hash.provider';
import { Md5HashProvider } from '../domain/name-based/md5-hash.provider';

export class CryptoMd5HashProvider
  extends CryptoHashProvider
  implements Md5HashProvider
{
  hash(data: Buffer): Promise<Buffer> {
    return this.createHash('md5', data);
  }
}
