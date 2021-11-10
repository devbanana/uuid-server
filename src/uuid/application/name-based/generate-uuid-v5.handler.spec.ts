import { UuidV5 } from '../../domain/name-based/uuid-v5';
import { Test, TestingModule } from '@nestjs/testing';
import { GenerateUuidV5Handler } from './generate-uuid-v5.handler';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { PredefinedNamespaces } from '../../domain/name-based/predefined-namespaces';
import { UuidNamespace } from '../../domain/name-based/uuid-namespace';
import { UuidName } from '../../domain/name-based/uuid-name';
import { GenerateUuidV5Command } from './generate-uuid-v5.command';
import { UuidFormats } from '../../domain/uuid-formats';
import { getFormatMethod } from '../../../../test/utils/test.helpers';
import { Sha1HashProvider } from '../../domain/name-based/sha1-hash.provider';
import { FakeSha1HashProvider } from '../../../../test/utils/test.fakes';

describe('GenerateUuidV5Handler', () => {
  const uuid = UuidV5.fromRfc4122('0cabaa1d-1c4d-5cf5-8938-b56ac03409f4');
  let spy: jest.SpyInstance<
    ReturnType<Sha1HashProvider['hash']>,
    jest.ArgsType<Sha1HashProvider['hash']>
  >;
  let handler: GenerateUuidV5Handler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateUuidV5Handler,
        UuidFormatter,
        { provide: Sha1HashProvider, useClass: FakeSha1HashProvider },
      ],
    }).compile();

    handler = module.get<GenerateUuidV5Handler>(GenerateUuidV5Handler);
    const provider = module.get<Sha1HashProvider, FakeSha1HashProvider>(
      Sha1HashProvider,
    );

    // noinspection SpellCheckingInspection
    provider.data = Buffer.from(
      '0cabaa1d1c4dacf54938b56ac03409f429b1076e',
      'hex',
    );
    spy = jest.spyOn(provider, 'hash');
  });

  it('passes the namespace and name', async () => {
    await handler.execute(
      new GenerateUuidV5Command(PredefinedNamespaces.Dns, 'devbanana.me'),
    );

    expect(spy).toHaveBeenCalledWith(
      Buffer.concat([
        UuidNamespace.fromPredefined(PredefinedNamespaces.Dns).asBuffer(),
        UuidName.fromString('devbanana.me').asBuffer(),
      ]),
    );
  });

  it('can accept an RFC4122 namespace', async () => {
    const namespace = '016f0f4d-744d-4cec-9369-c558a5f22da8';
    await handler.execute(new GenerateUuidV5Command(namespace, 'foo'));

    expect(spy).toHaveBeenCalledWith(
      Buffer.concat([
        UuidNamespace.fromRfc4122(namespace).asBuffer(),
        UuidName.fromString('foo').asBuffer(),
      ]),
    );
  });

  it.each`
    format
    ${'base32'}
    ${'base58'}
    ${'base64'}
    ${'binary'}
    ${'number'}
  `(
    'can be formatted as $format',
    async ({ format }: { format: UuidFormats }) => {
      const result = await handler.execute(
        new GenerateUuidV5Command(
          PredefinedNamespaces.Dns,
          'devbanana.me',
          format,
        ),
      );

      expect(result.uuid).toBe(uuid[getFormatMethod(format)]().toString());
    },
  );

  afterEach(() => {
    spy.mockClear();
  });
});
