import { Buffer } from 'buffer';

export abstract class RandomBytesProvider {
  abstract generate(bytes: number): Promise<Buffer>;
}
