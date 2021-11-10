import { GenerateUuidV4Handler } from './generate-uuid-v4.handler';
import { Test, TestingModule } from '@nestjs/testing';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidV4 } from '../../domain/random/uuid-v4';
import { GenerateUuidV4Command } from './generate-uuid-v4.command';
import { UuidFormats } from '../../domain/uuid-formats';
import { getFormatMethod } from '../../../../test/utils/test.helpers';
import { RandomBytesProvider } from '../../domain/random-bytes.provider';
import { FakeRandomBytesProvider } from '../../../../test/utils/test.fakes';

describe('GenerateUuidV4Handler', () => {
  const uuid = UuidV4.fromRfc4122('d3f95d9b-0a28-4cab-932c-66dd719939c1');
  let handler: GenerateUuidV4Handler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateUuidV4Handler,
        UuidFormatter,
        { provide: RandomBytesProvider, useClass: FakeRandomBytesProvider },
      ],
    }).compile();

    handler = module.get<GenerateUuidV4Handler>(GenerateUuidV4Handler);
    module.get<RandomBytesProvider, FakeRandomBytesProvider>(
      RandomBytesProvider,
    ).bytes = Buffer.from('d3f95d9b0a289cab132c66dd719939c1', 'hex');
  });

  it('does not require any parameters', async () => {
    const result = await handler.execute(new GenerateUuidV4Command());

    expect(result.uuid).toBe(uuid.asRfc4122());
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
