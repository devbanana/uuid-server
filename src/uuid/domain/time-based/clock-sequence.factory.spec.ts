import {
  FakeRandomBytesProvider,
  FakeUuidV1Repository,
} from '../../../../test/utils/test.fakes';
import { ClockSequenceFactory } from './clock-sequence.factory';
import { ClockSequence } from './clock-sequence';
import { Node } from './node';
import { UuidTime } from './uuid-time';
import { Buffer } from 'buffer';
import { UuidV1 } from './uuid-v1';

describe('ClockSequenceFactory', () => {
  let randomBytesProvider: FakeRandomBytesProvider;
  let uuidV1Repository: FakeUuidV1Repository;
  let clockSequenceFactory: ClockSequenceFactory;
  const today = '2021-11-11T00:00:00Z';
  const node = Node.fromString('c4:29:8b:b8:42:7a');

  beforeEach(() => {
    randomBytesProvider = new FakeRandomBytesProvider();
    uuidV1Repository = new FakeUuidV1Repository();
    clockSequenceFactory = new ClockSequenceFactory(
      uuidV1Repository,
      randomBytesProvider,
    );
  });

  describe('for a new node ID', () => {
    it('generates a new clock sequence', async () => {
      randomBytesProvider.addRandomValue(Buffer.from('0dd5', 'hex'));

      const clockSequence = await clockSequenceFactory.create(
        UuidTime.fromString(today),
        node,
      );

      expect(clockSequence.asNumber()).toBe(0x0dd5);
    });

    it('does not generate a clock sequence over 0x3fff', async () => {
      randomBytesProvider.addRandomValue(Buffer.from('666a', 'hex'));

      const clockSequence = await clockSequenceFactory.create(
        UuidTime.fromString(today),
        node,
      );
      expect(clockSequence.asNumber()).toBe(0x266a);
    });
  });

  describe('for an existing node ID', () => {
    beforeEach(async () => {
      await uuidV1Repository.save(
        UuidV1.create(
          UuidTime.fromString(today),
          ClockSequence.fromNumber(0x134f),
          node,
        ),
      );
    });

    it('uses the same clock sequence if time is after previous time', async () => {
      const clockSequence = await clockSequenceFactory.create(
        UuidTime.fromMilliseconds(new Date(today).getTime() + 1000 * 60),
        node,
      );

      expect(clockSequence.asNumber()).toBe(0x134f);
    });

    it('increments the clock sequence if time is before previous time', async () => {
      const clockSequence = await clockSequenceFactory.create(
        UuidTime.fromMilliseconds(new Date(today).getTime() - 1000 * 60),
        node,
      );

      expect(clockSequence.asNumber()).toBe(0x1350);
    });
  });
});
