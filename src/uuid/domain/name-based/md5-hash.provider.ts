import { Buffer } from 'buffer';
import { HashProvider } from './hash.provider';

export abstract class Md5HashProvider implements HashProvider {
  abstract hash(data: Buffer): Promise<Buffer>;
}
