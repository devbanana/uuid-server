import { GenerateUuidV1Handler } from './generate-uuid-v1.handler';
import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { Test, TestingModule } from '@nestjs/testing';
import { UuidV1 } from '../../domain/v1/uuid-v1';
import { UuidTime } from '../../domain/v1/uuid-time';
import { ClockSequence } from '../../domain/v1/clock-sequence';
import { Node } from '../../domain/v1/node';
import { getFormatMethod } from '../../../../test/get-format-method';
import { UuidFormats } from '../../domain/uuid-formats';

describe('GenerateUuidV1Handler', () => {
  const uuid = 'd57854d0-2aab-11ec-8da1-817a6c23fd17';
  const mockService = {
    generateV1: jest.fn(() => {
      return UuidV1.fromRfc4122(uuid);
    }),
  };

  let handler: GenerateUuidV1Handler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateUuidV1Handler,
        { provide: 'UuidServiceInterface', useValue: mockService },
      ],
    }).compile();

    handler = module.get<GenerateUuidV1Handler>(GenerateUuidV1Handler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should generate a V1 UUID', async () => {
    const uuidResult = await handler.execute(new GenerateUuidV1Command());

    expect(uuidResult).toBeInstanceOf(GenerateUuidViewModel);
    expect(uuidResult.uuid).toBe(uuid);
    expect(mockService.generateV1).toHaveBeenCalled();
    expect(mockService.generateV1).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
    );
  });

  it('should pass the time to the UUID service', async () => {
    const time = '2021-10-12T00:00:00Z';
    await handler.execute(new GenerateUuidV1Command({ time }));

    expect(mockService.generateV1).toHaveBeenCalledWith(
      UuidTime.fromString(time),
      undefined,
      undefined,
    );
  });

  it('should pass the clock sequence to the UUID service', async () => {
    const clockSeq = 0x38f4;
    await handler.execute(new GenerateUuidV1Command({ clockSeq }));

    expect(mockService.generateV1).toHaveBeenCalledWith(
      undefined,
      ClockSequence.fromNumber(clockSeq),
      undefined,
    );
  });

  it('should pass a 0 clock sequence to the UUID service', async () => {
    const clockSeq = 0;
    await handler.execute(new GenerateUuidV1Command({ clockSeq }));

    expect(mockService.generateV1).toHaveBeenCalledWith(
      undefined,
      ClockSequence.fromNumber(0),
      undefined,
    );
  });

  it('should pass the node to the UUID service', async () => {
    const node = '0D:02:F4:17:EE:DF';
    await handler.execute(new GenerateUuidV1Command({ node }));

    expect(mockService.generateV1).toHaveBeenCalledWith(
      undefined,
      undefined,
      Node.fromString(node),
    );
  });

  // noinspection SpellCheckingInspection
  it.each`
    format       | result
    ${'rfc4122'} | ${uuid}
    ${'base32'}  | ${'6NF1AD0ANB27P8V8C1F9P27Z8Q'}
    ${'base58'}  | ${'TMtgcQDmejpibckVGv9wca'}
    ${'base64'}  | ${'1XhU0CqrEeyNoYF6bCP9Fw=='}
    ${'binary'}  | ${'\xd5\x78\x54\xd0\x2a\xab\x11\xec\x8d\xa1\x81\x7a\x6c\x23\xfd\x17'}
    ${'number'}  | ${'283750358940280951322750379673606421783'}
  `(
    'should format the UUID as $format',
    async ({ format, result }: { format: UuidFormats; result: string }) => {
      const uuidV1 = UuidV1.fromRfc4122(uuid);
      const spy = jest.spyOn(uuidV1, getFormatMethod(format));

      mockService.generateV1.mockImplementationOnce(() => uuidV1);

      const response = await handler.execute(
        new GenerateUuidV1Command({ format }),
      );

      expect(spy).toHaveBeenCalled();
      expect(response.uuid).toBe(result);
    },
  );

  afterEach(() => {
    mockService.generateV1.mockClear();
  });
});
