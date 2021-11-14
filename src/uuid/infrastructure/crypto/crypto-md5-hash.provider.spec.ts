import { CryptoMd5HashProvider } from './crypto-md5-hash.provider';

describe('CryptoMd5HashProvider', () => {
  it('can hash a value', async () => {
    const md5HashProvider = new CryptoMd5HashProvider();
    // noinspection SpellCheckingInspection
    const hash = await md5HashProvider.hash(Buffer.from('abcd'));

    expect(hash.toString('hex')).toBe('e2fc714c4727ee9395f324cd2e7f331f');
  });
});
