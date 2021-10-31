import { Test, TestingModule } from '@nestjs/testing';
import { UuidService } from './uuid.service';
import { validate, version } from 'uuid';
import { UuidTime } from '../domain/time-based/uuid-time';
import { ClockSequence } from '../domain/time-based/clock-sequence';
import { Node } from '../domain/time-based/node';
import { UuidNamespace } from '../domain/name-based/uuid-namespace';
import { UuidName } from '../domain/name-based/uuid-name';

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
      const uuid = provider.generateV1().toString();

      expect(validate(uuid)).toBeTruthy();
      expect(version(uuid)).toBe(1);
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

  describe('Name-based', () => {
    const namespace = '41424344-4546-4748-494a-4b4c4d4e4f50';

    it('should generate a V3 UUID', async () => {
      const result = await provider.generateV3(
        UuidName.fromString('foo'),
        UuidNamespace.fromRfc4122(namespace),
      );

      expect(result.asRfc4122()).toBe('66a2f74f-6ebc-3469-b464-a3f2820c37b3');
    });

    it('should generate a V5 UUID', async () => {
      const result = await provider.generateV5(
        UuidName.fromString('foo'),
        UuidNamespace.fromRfc4122(namespace),
      );

      expect(result.asRfc4122()).toBe('7b366cbd-391c-5cfb-bb55-cba2db422d0e');
    });
  });
});
