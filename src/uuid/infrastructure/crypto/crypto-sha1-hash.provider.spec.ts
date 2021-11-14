import { CryptoSha1HashProvider } from './crypto-sha1-hash.provider';
import { Buffer } from 'buffer';

describe('CryptoSha1HashProvider', () => {
  it('can hash a value', async () => {
    const sha1HashProvider = new CryptoSha1HashProvider();
    // noinspection SpellCheckingInspection
    const hash = await sha1HashProvider.hash(Buffer.from('abcd'));

    expect(hash.toString('hex')).toBe(
      '81fe8bfe87576c3ecb22426f8e57847382917acf',
    );
  });
});
