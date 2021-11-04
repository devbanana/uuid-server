import { GenerateUuidV4Handler } from './generate-uuid-v4.handler';
import { Test, TestingModule } from '@nestjs/testing';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidV4 } from '../../domain/random/uuid-v4';
import { UuidServiceInterface } from '../../domain/uuid-service.interface';
import { GenerateUuidV4Command } from './generate-uuid-v4.command';
import { UuidFormats } from '../../domain/uuid-formats';
import { getFormatMethod } from '../../../../test/utils/test.helpers';

describe('GenerateUuidV4Handler', () => {
  const uuid = UuidV4.fromRfc4122('5bfebb6a-4edf-4a7f-b667-b29b8b1993f6');
  const mockService: Record<
    keyof Pick<UuidServiceInterface, 'generateV4'>,
    jest.Mock<UuidV4>
  > = {
    generateV4: jest.fn(() => uuid),
  };

  let handler: GenerateUuidV4Handler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateUuidV4Handler,
        UuidFormatter,
        { provide: 'UuidServiceInterface', useValue: mockService },
      ],
    }).compile();

    handler = module.get<GenerateUuidV4Handler>(GenerateUuidV4Handler);
  });

  it('does not require any parameters', async () => {
    const result = await handler.execute(new GenerateUuidV4Command());

    expect(result.uuid).toBe(uuid.asRfc4122());
    expect(mockService.generateV4).toHaveBeenCalled();
  });

  it.each`
    format
    ${UuidFormats.Base32}
    ${UuidFormats.Base58}
    ${UuidFormats.Base64}
    ${UuidFormats.Binary}
    ${UuidFormats.Number}
  `(
    'can be formatted as $format',
    async ({ format }: { format: UuidFormats }) => {
      const result = await handler.execute(new GenerateUuidV4Command(format));

      expect(result.uuid).toBe(uuid[getFormatMethod(format)]().toString());
    },
  );
});
