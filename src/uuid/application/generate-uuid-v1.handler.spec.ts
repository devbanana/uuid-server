import { GenerateUuidV1Handler } from './generate-uuid-v1.handler';
import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { Test, TestingModule } from '@nestjs/testing';
import { UuidV1 } from '../domain/uuid-v1';
import { UuidTime } from '../domain/uuid-time';
import { ClockSequence } from '../domain/clock-sequence';

describe('GenerateUuidV1Handler', () => {
  const uuid = 'd57854d0-2aab-11ec-8da1-817a6c23fd17';
  const mockService = {
    generate: jest.fn(() => {
      return UuidV1.fromUuid(uuid);
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

    expect(uuidResult).toBe(uuid);
    expect(mockService.generate).toHaveBeenCalled();
    expect(mockService.generate).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should pass the time to the UUID service', async () => {
    const time = '2021-10-12T00:00:00Z';
    const uuidResult = await handler.execute(
      new GenerateUuidV1Command({ time }),
    );

    expect(uuidResult).toBe(uuid);
    expect(mockService.generate).toHaveBeenCalledWith(
      UuidTime.fromString(time),
      undefined,
    );
  });

  it('should pass the clock sequence to the UUID service', async () => {
    const clockSeq = 0x38f4;
    const uuidResult = await handler.execute(
      new GenerateUuidV1Command({ clockSeq }),
    );

    expect(uuidResult).toBe(uuid);
    expect(mockService.generate).toHaveBeenCalledWith(
      undefined,
      ClockSequence.fromNumber(clockSeq),
    );
  });

  it('should pass a 0 clock sequence to the UUID service', async () => {
    const clockSeq = 0;
    await handler.execute(new GenerateUuidV1Command({ clockSeq }));

    expect(mockService.generate).toHaveBeenCalledWith(
      undefined,
      ClockSequence.fromNumber(0),
    );
  });

  afterEach(() => {
    mockService.generate.mockClear();
  });
});
