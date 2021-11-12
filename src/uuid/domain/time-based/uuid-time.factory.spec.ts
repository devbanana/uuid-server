import {
  FakeClock,
  FakeUuidV1Repository,
} from '../../../../test/utils/test.fakes';
import { UuidTimeFactory } from './uuid-time.factory';
import { UuidTime } from './uuid-time';
import { Node } from './node';
import { UuidV1 } from './uuid-v1';
import { ClockSequence } from './clock-sequence';

describe('UuidTimeFactory', () => {
  let clock: FakeClock;
  let uuidV1Repository: FakeUuidV1Repository;
  let timeFactory: UuidTimeFactory;
  const today = '2021-11-11T00:00:00Z';
  const clockSequence = ClockSequence.fromNumber(0x36f5);
  const node = Node.fromString('c4:29:8b:b8:42:7a');

  beforeEach(() => {
    clock = new FakeClock();
    uuidV1Repository = new FakeUuidV1Repository();
    timeFactory = new UuidTimeFactory(clock, uuidV1Repository);
  });

  it('returns the given time', async () => {
    const time = await timeFactory.create(today, node);

    expect(time).toStrictEqual(UuidTime.fromString(today));
  });

  it('can return the current time', async () => {
    clock.time = new Date(today).getTime();
    const time = await timeFactory.create(undefined, node);

    expect(time).toStrictEqual(UuidTime.fromString(today));
  });

  it('returns the next nanosecond interval if given time has been used', async () => {
    uuidV1Repository.add(
      UuidV1.create(UuidTime.fromString(today), clockSequence, node),
    );

    const time = await timeFactory.create(today, node);
    expect(time).toStrictEqual(
      UuidTime.fromString(today).withAddedNanoseconds(100),
    );
  });

  it('returns the next nanosecond interval if current time has been used', async () => {
    uuidV1Repository.add(
      UuidV1.create(UuidTime.fromString(today), clockSequence, node),
    );
    clock.time = new Date(today).getTime();

    const time = await timeFactory.create(undefined, node);
    expect(time).toStrictEqual(
      UuidTime.fromString(today).withAddedNanoseconds(100),
    );
  });

  it('throws an error if no more nanosecond intervals are available', async () => {
    for (let ns = 0; ns < 1000000; ns += 100) {
      uuidV1Repository.add(
        UuidV1.create(
          UuidTime.fromString(today).withAddedNanoseconds(ns),
          clockSequence,
          node,
        ),
      );
    }

    expect.assertions(1);

    await timeFactory
      .create(today, node)
      .catch((error: Error) =>
        expect(error.message).toBe(
          'Too many UUIDs generated for this time. ' +
            'Please wait and try again.',
        ),
      );
  });
});
