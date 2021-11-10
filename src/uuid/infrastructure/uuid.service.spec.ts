import { Test, TestingModule } from '@nestjs/testing';
import { UuidService } from './uuid.service';
import { UuidTime } from '../domain/time-based/uuid-time';
import { ClockSequence } from '../domain/time-based/clock-sequence';
import { Node } from '../domain/time-based/node';
import { Uuid } from '../domain/uuid';

describe('UuidService', () => {
  let provider: UuidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UuidService],
    }).compile();

    provider = module.get<UuidService>(UuidService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Time-based', () => {
    it('should generate a V1 UUID', () => {
      const uuid = provider.generateV1();

      expect(Uuid.isValid(uuid.asBuffer())).toBeTruthy();
      expect(uuid.version).toBe(1);
    });

    it('should use the given time', () => {
      const time = '2021-10-11 05:43:27';
      const uuid = provider.generateV1(UuidTime.fromString(time));

      expect(uuid.time).toStrictEqual(UuidTime.fromString(time));
    });

    it('should use the given clock sequence', () => {
      const clockSeq = 0x2eda;
      const uuid = provider.generateV1(
        undefined,
        ClockSequence.fromNumber(clockSeq),
      );

      expect(uuid.clockSequence.asNumber()).toBe(clockSeq);
    });

    it('should use the given node', () => {
      const uuid = provider.generateV1(
        undefined,
        undefined,
        Node.fromString('FE:3E:9A:8B:06:CD'),
      );

      expect(uuid.node).toStrictEqual(Node.fromString('FE:3E:9A:8B:06:CD'));
    });
  });
});
