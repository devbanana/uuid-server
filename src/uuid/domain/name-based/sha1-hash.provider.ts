import { HashProvider } from './hash.provider';
import { Buffer } from 'buffer';

export abstract class Sha1HashProvider implements HashProvider {
  abstract hash(data: Buffer): Promise<Buffer>;
}
