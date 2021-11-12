import { GenerateUuidV1Handler } from './generate-uuid-v1.handler';
import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { Test, TestingModule } from '@nestjs/testing';
import { UuidV1 } from '../../domain/time-based/uuid-v1';
import { UuidFormats } from '../../domain/uuid-formats';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidTimeFactory } from '../../domain/time-based/uuid-time.factory';
import { ClockSequenceFactory } from '../../domain/time-based/clock-sequence.factory';
import { NodeFactory } from '../../domain/time-based/node.factory';
import { RandomBytesProvider } from '../../domain/random-bytes.provider';
import {
  FakeClock,
  FakeRandomBytesProvider,
  FakeUuidV1Repository,
} from '../../../../test/utils/test.fakes';
import { UuidV1Repository } from '../../domain/time-based/uuid-v1.repository';
import { Buffer } from 'buffer';
import { Clock } from '../../domain/time-based/clock';
import { ClockSequence } from '../../domain/time-based/clock-sequence';
import { Node } from '../../domain/time-based/node';
import { UuidTime } from '../../domain/time-based/uuid-time';

describe('GenerateUuidV1Handler', () => {
  let handler: GenerateUuidV1Handler;
  let randomBytesProvider: FakeRandomBytesProvider;
  let clock: FakeClock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateUuidV1Handler,
        UuidFormatter,
        UuidTimeFactory,
        ClockSequenceFactory,
        NodeFactory,
        { provide: RandomBytesProvider, useClass: FakeRandomBytesProvider },
        { provide: Clock, useClass: FakeClock },
        { provide: UuidV1Repository, useClass: FakeUuidV1Repository },
      ],
    }).compile();

    handler = module.get<GenerateUuidV1Handler>(GenerateUuidV1Handler);

    randomBytesProvider = module.get<
      RandomBytesProvider,
      FakeRandomBytesProvider
    >(RandomBytesProvider);

    clock = module.get<Clock, FakeClock>(Clock);
  });

  it('should generate a V1 UUID', async () => {
    // Random node
    // noinspection SpellCheckingInspection
    randomBytesProvider.addRandomValue(Buffer.from('5fea650adfbf', 'hex'));
    // Random clock sequence
    randomBytesProvider.addRandomValue(Buffer.from('2cf4', 'hex'));

    clock.time = new Date('2021-11-12T11:01:54.106Z').getTime();

    const uuidResult = await handler.execute(new GenerateUuidV1Command());

    expect(uuidResult).toBeInstanceOf(GenerateUuidViewModel);
    expect(uuidResult.uuid).toBe('f20b29a0-43a7-11ec-acf4-5fea650adfbf');
  });

  it('should use the given time', async () => {
    const time = '2021-11-12T12:23:40.157Z';
    randomBytesProvider.addRandomValue(Buffer.from('5da5b21acf8b', 'hex'));
    randomBytesProvider.addRandomValue(Buffer.from('1d18', 'hex'));

    const result = await handler.execute(new GenerateUuidV1Command({ time }));

    expect(result.uuid).toBe('5e4722d0-43b3-11ec-9d18-5da5b21acf8b');
  });

  it('should use the given node ID', async () => {
    const node = '87:32:54:98:18:cd';
    const time = '2021-11-12T14:11:46.126Z';
    const clockSequence = Buffer.from('23de', 'hex');

    randomBytesProvider.addRandomValue(clockSequence);
    clock.time = new Date(time).getTime();

    const result = await handler.execute(new GenerateUuidV1Command({ node }));

    expect(result.uuid).toBe(
      UuidV1.create(
        UuidTime.fromString(time),
        ClockSequence.fromNumber(clockSequence.readUInt16BE()),
        Node.fromString(node),
      ).asRfc4122(),
    );
  });

  // noinspection SpellCheckingInspection
  it.each`
    format       | result
    ${'rfc4122'} | ${'23abb7b0-43c4-11ec-9f3b-5be6b929a1a0'}
    ${'base32'}  | ${'13NEVV0GY427P9YETVWTWJK8D0'}
    ${'base58'}  | ${'5QUgEPSynNAXXXu9PmaqFD'}
    ${'base64'}  | ${'I6u3sEPEEeyfO1vmuSmhoA=='}
    ${'binary'}  | ${'\x23\xab\xb7\xb0C\xc4\x11\xec\x9f\x3b\x5b\xe6\xb9\x29\xa1\xa0'}
    ${'number'}  | ${'47414588261368111606133223417218441632'}
  `(
    'should format the UUID as $format',
    async ({ format, result }: { format: UuidFormats; result: string }) => {
      randomBytesProvider.addRandomValue(Buffer.from('5be6b929a1a0', 'hex'));
      randomBytesProvider.addRandomValue(Buffer.from('1f3b', 'hex'));
      clock.time = new Date('2021-11-12T14:23:43.275Z').getTime();

      const response = await handler.execute(
        new GenerateUuidV1Command({ format }),
      );

      expect(response.uuid).toBe(result);
    },
  );
});
