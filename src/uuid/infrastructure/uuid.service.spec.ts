import { Test, TestingModule } from '@nestjs/testing';
import { UuidService } from './uuid.service';
import { validate, version } from 'uuid';
import { UuidTime } from '../domain/v1/uuid-time';
import { ClockSequence } from '../domain/v1/clock-sequence';
import { Node } from '../domain/v1/node';

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

  it('should generate a V1 UUID', () => {
    const uuid = provider.generate().toString();

    expect(validate(uuid)).toBeTruthy();
    expect(version(uuid)).toBe(1);
  });

  it('should use the given time', () => {
    const time = '2021-10-11 05:43:27';
    const uuid = provider.generate(UuidTime.fromString(time));

    expect(uuid.time).toStrictEqual(UuidTime.fromString(time));
  });

  it('should use the given clock sequence', () => {
    const clockSeq = 0x2eda;
    const uuid = provider.generate(
      undefined,
      ClockSequence.fromNumber(clockSeq),
    );

    expect(uuid.clockSequence.asNumber()).toBe(clockSeq);
  });

  it('should use the given node', () => {
    const uuid = provider.generate(
      undefined,
      undefined,
      Node.fromString('FE:3E:9A:8B:06:CD'),
    );

    expect(uuid.node).toStrictEqual(Node.fromString('FE:3E:9A:8B:06:CD'));
  });
});
