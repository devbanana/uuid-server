import { RandomBytesProvider } from '../../domain/random-bytes.provider';
import { Buffer } from 'buffer';
import { randomBytes } from 'crypto';

export class CryptoRandomBytesProvider implements RandomBytesProvider {
  generate(bytes: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      randomBytes(bytes, (err, data) => {
        // istanbul ignore next
        if (err) {
          reject(err);
          return;
        }

        resolve(data);
      });
    });
  }
}
