import { CryptoRandomBytesProvider } from './crypto-random-bytes.provider';

describe('CryptoRandomBytesProvider', () => {
  const provider = new CryptoRandomBytesProvider();

  it('can generate random bytes', async () => {
    const data = await provider.generate(4);
    expect(data).toHaveLength(4);
  });

  it('cannot accept a negative number of bytes', async () => {
    expect.assertions(1);

    await expect(provider.generate(-1)).rejects.toHaveProperty(
      'name',
      'RangeError',
    );
  });
});
