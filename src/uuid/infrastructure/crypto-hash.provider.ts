import { createHash, Hash } from 'crypto';
import { Buffer } from 'buffer';

export class CryptoHashProvider {
  protected createHash(algorithm: string, data: Buffer): Promise<Buffer> {
    const hash = createHash(algorithm);
    const promise = this.createPromise(hash);
    hash.end(data);

    return promise;
  }

  protected createPromise(hash: Hash): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      hash.on('readable', () => {
        const data = hash.read() as unknown;
        // istanbul ignore next
        if (!(data instanceof Buffer)) {
          reject('Could not read hash');
          return;
        }

        resolve(data);
      });
    });
  }
}
