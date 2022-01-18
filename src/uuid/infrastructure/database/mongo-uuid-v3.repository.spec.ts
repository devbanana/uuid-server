import { Test, TestingModule } from '@nestjs/testing';
import { MongoUuidV3Repository } from './mongo-uuid-v3.repository';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConnection } from './database.connection';
import { Clock } from '../../domain/time-based/clock';
import { FakeClock } from '../../../../test/utils/test.fakes';
import { Binary, Collection } from 'mongodb';
import { UuidV3Schema } from './schemas/uuid-v3.schema';
import { UuidV3 } from '../../domain/name-based/uuid-v3';

const now = new Date('2022-01-18T12:17:09.228Z');

describe('MongoUuidV3Repository', () => {
  let provider: MongoUuidV3Repository;
  let connection: DatabaseConnection;
  let uuids: Collection<UuidV3Schema>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        MongoUuidV3Repository,
        DatabaseConnection,
        { provide: Clock, useClass: FakeClock },
      ],
    }).compile();

    provider = module.get<MongoUuidV3Repository>(MongoUuidV3Repository);
    connection = module.get<DatabaseConnection>(DatabaseConnection);
    await connection.client.connect();
    uuids = connection.db.collection<UuidV3Schema>('uuids');

    module.get<Clock, FakeClock>(Clock).time = now.getTime();
  });

  it('should save a UUID', async () => {
    const uuid = UuidV3.fromRfc4122('70d7bd98-e306-3390-a9e5-9d5daffbbdad');

    await provider.save(uuid);

    const result = await uuids.findOne({
      version: 3,
      uuid: new Binary(uuid.asBuffer()),
    });

    expect(result).not.toBeNull();
    expect(result?.created).toStrictEqual(now);
  });

  afterEach(async () => {
    await uuids.deleteMany({ version: 3 });
    await connection.client.close();
  });
});
