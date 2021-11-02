import { UuidV5 } from '../../domain/name-based/uuid-v5';
import { UuidServiceInterface } from '../../domain/uuid-service.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { GenerateUuidV5Handler } from './generate-uuid-v5.handler';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { PredefinedNamespaces } from '../../domain/name-based/predefined-namespaces';
import { UuidNamespace } from '../../domain/name-based/uuid-namespace';
import { UuidName } from '../../domain/name-based/uuid-name';
import { GenerateUuidV5Command } from './generate-uuid-v5.command';
import { UuidFormats } from '../../domain/uuid-formats';
import { getFormatMethod } from '../../../../test/test.helpers';

describe('GenerateUuidV5Handler', () => {
  const uuid = UuidV5.fromRfc4122('0cabaa1d-1c4d-5cf5-8938-b56ac03409f4');
  const mockService: Record<
    keyof Pick<UuidServiceInterface, 'generateV5'>,
    jest.Mock<UuidV5>
  > = {
    generateV5: jest.fn(() => uuid),
  };

  let handler: GenerateUuidV5Handler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateUuidV5Handler,
        UuidFormatter,
        {
          provide: 'UuidServiceInterface',
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GenerateUuidV5Handler>(GenerateUuidV5Handler);
  });

  it('passes the namespace and name to the UUID service', async () => {
    await handler.execute(
      new GenerateUuidV5Command(PredefinedNamespaces.Dns, 'devbanana.me'),
    );

    expect(mockService.generateV5).toHaveBeenCalledWith(
      UuidNamespace.fromPredefined(PredefinedNamespaces.Dns),
      UuidName.fromString('devbanana.me'),
    );
  });

  it('can accept an RFC4122 namespace', async () => {
    const namespace = '016f0f4d-744d-4cec-9369-c558a5f22da8';
    await handler.execute(new GenerateUuidV5Command(namespace, 'foo'));

    expect(mockService.generateV5).toHaveBeenCalledWith(
      UuidNamespace.fromRfc4122(namespace),
      UuidName.fromString('foo'),
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
    mockService.generateV5.mockClear();
  });
});
