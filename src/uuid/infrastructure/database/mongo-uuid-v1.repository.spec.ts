import { Test, TestingModule } from '@nestjs/testing';
import { MongoUuidV1Repository } from './mongo-uuid-v1.repository';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConnection } from './database.connection';
import { Node } from '../../domain/time-based/node';
import { UuidTime } from '../../domain/time-based/uuid-time';
import { UuidV1 } from '../../domain/time-based/uuid-v1';
import { ClockSequence } from '../../domain/time-based/clock-sequence';
import { Binary, InsertOneResult } from 'mongodb';
import { UuidV1Schema } from './schemas/uuid-v1.schema';

const nodes: Node[] = [
  Node.fromString('0d:5e:ac:59:9e:b6'),
  Node.fromString('11:2c:ce:1a:5c:4b'),
];

const sequences: ClockSequence[] = [
  ClockSequence.fromNumber(0x18f0),
  ClockSequence.fromNumber(0x0f97),
];

const now = new Date('2021-11-13T16:07:32.005Z').getTime();

describe('MysqlUuidV1Repository', () => {
  let provider: MongoUuidV1Repository;
  let connection: DatabaseConnection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [MongoUuidV1Repository, DatabaseConnection],
    }).compile();

    provider = module.get<MongoUuidV1Repository>(MongoUuidV1Repository);
    connection = module.get<DatabaseConnection>(DatabaseConnection);
    await connection.onModuleInit();

    await createFixtures(connection);
  });

  describe('when counting the number of UUIDs by node', () => {
    it('should return the correct count when given an existing node', async () => {
      const count = await provider.countUuidsByNode(nodes[0]);
      expect(count).toBe(5);
    });

    it('should return 0 if the node does not exist', async () => {
      const count = await provider.countUuidsByNode(
        Node.fromString('b1:6c:88:1a:3f:c8'),
      );
      expect(count).toBe(0);
    });
  });

  describe('when getting the last created UUID by node', () => {
    it('should return the correct UUID when the node exists', async () => {
      const uuid = await provider.getLastCreatedUuidByNode(nodes[0]);
      expect(uuid).toBeDefined();
      expect(uuid?.time.date).toStrictEqual(new Date(now - 1000 * 60));
      expect(uuid?.clockSequence).toStrictEqual(sequences[0].increment());
    });

    it('should return undefined if the node does not exist', async () => {
      const uuid = await provider.getLastCreatedUuidByNode(
        Node.fromString('b5:df:ea:cb:72:c7'),
      );
      expect(uuid).toBeUndefined();
    });
  });

  describe('when getting the last UUID by time and node', () => {
    it('returns the last UUID by nanosecond', async () => {
      const uuid = await provider.getLastUuidByTimeAndNode(
        UuidTime.fromMilliseconds(now + 1),
        nodes[1],
      );
      expect(uuid).toBeDefined();
      expect(uuid?.time.date).toStrictEqual(new Date(now + 1));
      expect(uuid?.time.nsOffset).toBe(100);
      expect(uuid?.node.asNumber()).toBe(nodes[1].asNumber());
    });

    it('returns undefined if the node does not exist', async () => {
      const uuid = await provider.getLastUuidByTimeAndNode(
        UuidTime.fromMilliseconds(now - 1),
        Node.fromString('11:2f:4e:5b:d1:be'),
      );
      expect(uuid).toBeUndefined();
    });

    it("returns undefined if the time can't be found", async () => {
      const uuid = await provider.getLastUuidByTimeAndNode(
        UuidTime.fromMilliseconds(now + 3),
        nodes[1],
      );
      expect(uuid).toBeUndefined();
    });
  });

  it('saves generated UUIDs', async () => {
    const uuid = UuidV1.create(
      UuidTime.fromMilliseconds(now + 6),
      sequences[1].increment(),
      nodes[1],
    );

    await provider.save(uuid);

    const result = await connection.db
      .collection<UuidV1Schema>('uuids')
      .findOne({ uuid: new Binary(uuid.asBuffer()) });

    expect(result).not.toBeNull();
  });

  afterAll(async () => {
    await connection.db.dropCollection('uuids');
    await connection.onModuleDestroy();
  });
});

async function createFixtures(connection: DatabaseConnection) {
  const uuidCollection = connection.db.collection<UuidV1Schema>('uuids');

  const uuids: UuidV1[] = [
    // First node
    createUuid(now, 0, 0),
    createUuid(now + 1, 0, 0),
    createUuid(now + 1, 100, 0),
    createUuid(now + 1, 200, 0),
    createUuid(now - 1000 * 60, 0, 0, true),

    // Second node
    createUuid(now + 1, 0, 1),
    createUuid(now + 1, 100, 1),
    createUuid(now + 2, 0, 1),
    createUuid(now + 5, 0, 1),
    createUuid(now + 4, 0, 1, true),
  ];

  const promises: Promise<InsertOneResult>[] = [];
  uuids.forEach(uuid => {
    const promise = uuidCollection.insertOne({
      type: 'rfc4122',
      version: 1,
      uuid: new Binary(uuid.asBuffer()),
      date: uuid.time.date,
      nsOffset: uuid.time.nsOffset,
      clockSequence: uuid.clockSequence.asNumber(),
      node: uuid.node.asNumber(),
    });
    promises.push(promise);
  });

  await Promise.all(promises);
}

function createUuid(
  time: number,
  addedNs: number,
  nodeIndex: number,
  increment = false,
) {
  let clockSequence = sequences[nodeIndex];
  if (increment) {
    clockSequence = clockSequence.increment();
  }

  return UuidV1.create(
    UuidTime.fromMilliseconds(time).withAddedNanoseconds(addedNs),
    clockSequence,
    nodes[nodeIndex],
  );
}
