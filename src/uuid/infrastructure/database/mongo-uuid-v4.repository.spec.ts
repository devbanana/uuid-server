import { Test, TestingModule } from '@nestjs/testing';
import { MongoUuidV4Repository } from './mongo-uuid-v4.repository';
import { DatabaseConnection } from './database.connection';
import { ConfigModule } from '@nestjs/config';
import { Binary, Collection } from 'mongodb';
import { UuidV4 } from '../../domain/random/uuid-v4';
import { UuidV4Schema } from './schemas/uuid-v4.schema';
import { Clock } from '../../domain/time-based/clock';
import { FakeClock } from '../../../../test/utils/test.fakes';

const now = new Date('2021-11-16T05:32:29.128Z');

describe('MongoUuidV4Repository', () => {
  let provider: MongoUuidV4Repository;
  let connection: DatabaseConnection;
  let uuids: Collection<UuidV4Schema>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        MongoUuidV4Repository,
        DatabaseConnection,
        { provide: Clock, useClass: FakeClock },
      ],
    }).compile();

    provider = module.get<MongoUuidV4Repository>(MongoUuidV4Repository);
    connection = module.get<DatabaseConnection>(DatabaseConnection);
    await connection.client.connect();
    uuids = connection.db.collection('uuids');

    module.get<Clock, FakeClock>(Clock).time = now.getTime();
  });

  it('should save a UUID', async () => {
    const uuid = UuidV4.fromRfc4122('92675314-501f-4a97-bfcc-a13bffb5d38c');

    await provider.save(uuid);

    const result = await uuids.findOne({
      version: 4,
      uuid: new Binary(uuid.asBuffer()),
    });

    expect(result).not.toBeNull();
    expect(result?.created).toStrictEqual(now);
  });

  afterEach(async () => {
    await uuids.deleteMany({ version: 4 });
    await connection.client.close();
  });
});
