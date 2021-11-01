import { UuidServiceInterface } from '../../domain/uuid-service.interface';
import { GenerateUuidV3Handler } from './generate-uuid-v3.handler';
import { Test, TestingModule } from '@nestjs/testing';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidV3 } from '../../domain/name-based/uuid-v3';
import { GenerateUuidV3Command } from './generate-uuid-v3.command';
import { UuidNamespace } from '../../domain/name-based/uuid-namespace';
import { UuidName } from '../../domain/name-based/uuid-name';
import { PredefinedNamespaces } from '../../domain/name-based/predefined-namespaces';
import { UuidFormats } from '../../domain/uuid-formats';
import { getFormatMethod } from '../../../../test/get-format-method';

describe('GenerateUuidV3Handler', () => {
  const uuid = UuidV3.fromRfc4122('d4970169-f9a4-31c9-a11b-08609bb119c2');
  const mockService: Record<
    keyof Pick<UuidServiceInterface, 'generateV3'>,
    jest.Mock<UuidV3>
  > = {
    generateV3: jest.fn(() => uuid),
  };

  let handler: GenerateUuidV3Handler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateUuidV3Handler,
        { provide: 'UuidServiceInterface', useValue: mockService },
        UuidFormatter,
      ],
    }).compile();

    handler = module.get<GenerateUuidV3Handler>(GenerateUuidV3Handler);
  });

  it('passes the namespace and name to the UUID service', async () => {
    const namespace = 'c99653e5-1752-4798-95aa-df25d0936eca';
    const result = await handler.execute(
      new GenerateUuidV3Command(namespace, 'foo'),
    );

    expect(result.uuid).toBe(uuid.asRfc4122());
    expect(mockService.generateV3).toHaveBeenCalledTimes(1);
    expect(mockService.generateV3).toHaveBeenCalledWith(
      UuidNamespace.fromRfc4122(namespace),
      UuidName.fromString('foo'),
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

      expect(mockService.generateV3).toHaveBeenCalledTimes(1);
      expect(mockService.generateV3).toHaveBeenCalledWith(
        UuidNamespace.fromPredefined(namespace),
        UuidName.fromString(name),
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

  afterEach(() => {
    mockService.generateV3.mockClear();
  });
});
