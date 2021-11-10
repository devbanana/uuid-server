import { Buffer } from 'buffer';

export interface HashProvider {
  hash(data: Buffer): Promise<Buffer>;
}
