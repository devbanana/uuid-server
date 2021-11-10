import { GenerateUuidV3Handler } from './generate-uuid-v3.handler';
import { Test, TestingModule } from '@nestjs/testing';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidV3 } from '../../domain/name-based/uuid-v3';
import { GenerateUuidV3Command } from './generate-uuid-v3.command';
import { UuidNamespace } from '../../domain/name-based/uuid-namespace';
import { UuidName } from '../../domain/name-based/uuid-name';
import { PredefinedNamespaces } from '../../domain/name-based/predefined-namespaces';
import { UuidFormats } from '../../domain/uuid-formats';
import { getFormatMethod } from '../../../../test/utils/test.helpers';
import { Md5HashProvider } from '../../domain/name-based/md5-hash.provider';
import { FakeMd5HashProvider } from '../../../../test/utils/test.fakes';
import { Buffer } from 'buffer';

describe('GenerateUuidV3Handler', () => {
  const uuid = UuidV3.fromRfc4122('d4970169-f9a4-31c9-a11b-08609bb119c2');
  let spy: jest.SpyInstance<
    ReturnType<Md5HashProvider['hash']>,
    jest.ArgsType<Md5HashProvider['hash']>
  >;
  let handler: GenerateUuidV3Handler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateUuidV3Handler,
        UuidFormatter,
        { provide: Md5HashProvider, useClass: FakeMd5HashProvider },
      ],
    }).compile();

    handler = module.get<GenerateUuidV3Handler>(GenerateUuidV3Handler);

    const provider = module.get<Md5HashProvider, FakeMd5HashProvider>(
      Md5HashProvider,
    );
    provider.data = Buffer.from('d4970169f9a4c1c9611b08609bb119c2', 'hex');
    spy = jest.spyOn(provider, 'hash');
  });

  it('passes the namespace and name', async () => {
    const namespace = 'c99653e5-1752-4798-95aa-df25d0936eca';
    const result = await handler.execute(
      new GenerateUuidV3Command(namespace, 'foo'),
    );

    expect(result.uuid).toBe(uuid.asRfc4122());
    expect(spy).toHaveBeenCalledWith(
      Buffer.concat([
        UuidNamespace.fromRfc4122(namespace).asBuffer(),
        UuidName.fromString('foo').asBuffer(),
      ]),
    );
  });

  it.each`
    namespace                    | name
    ${PredefinedNamespaces.Dns}  | ${'devbanana.me'}
    ${PredefinedNamespaces.Url}  | ${'https://www.devbanana.me'}
    ${PredefinedNamespaces.Oid}  | ${'1.3.6.1'}
    ${PredefinedNamespaces.X500} | ${'CN=Bob,C=US'}
  `(
    'can generate a UUID with the $namespace namespace',
    async ({
      namespace,
      name,
    }: {
      namespace: PredefinedNamespaces;
      name: string;
    }) => {
      await handler.execute(new GenerateUuidV3Command(namespace, name));

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        Buffer.concat([
          UuidNamespace.fromPredefined(namespace).asBuffer(),
          UuidName.fromString(name).asBuffer(),
        ]),
      );
    },
  );

  it.each`
    format
    ${'base32'}
    ${'base58'}
    ${'base64'}
    ${'binary'}
    ${'number'}
  `(
    'can format the UUID as $format',
    async ({ format }: { format: UuidFormats }) => {
      const result = await handler.execute(
        new GenerateUuidV3Command(
          PredefinedNamespaces.Dns,
          'devbanana.me',
          format,
        ),
      );

      expect(result.uuid).toBe(uuid[getFormatMethod(format)]().toString());
    },
  );

  afterEach(() => spy.mockClear());
});
