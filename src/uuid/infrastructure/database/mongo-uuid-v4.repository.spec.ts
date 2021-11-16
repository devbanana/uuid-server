import { Test, TestingModule } from '@nestjs/testing';
import { MongoUuidV4Repository } from './mongo-uuid-v4.repository';
import { DatabaseConnection } from './database.connection';
import { ConfigModule } from '@nestjs/config';
import { Binary, Collection } from 'mongodb';
import { UuidV4 } from '../../domain/random/uuid-v4';
import { UuidV4Schema } from './schemas/uuid-v4.schema';

describe('MongoUuidV4Repository', () => {
  let provider: MongoUuidV4Repository;
  let connection: DatabaseConnection;
  let uuids: Collection<UuidV4Schema>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [MongoUuidV4Repository, DatabaseConnection],
    }).compile();

    provider = module.get<MongoUuidV4Repository>(MongoUuidV4Repository);
    connection = module.get<DatabaseConnection>(DatabaseConnection);
    await connection.client.connect();
    uuids = connection.db.collection('uuids');
  });

  it('should save a UUID', async () => {
    const uuid = UuidV4.fromRfc4122('92675314-501f-4a97-bfcc-a13bffb5d38c');

    await provider.save(uuid);

    const result = await uuids.findOne({
      version: 4,
      uuid: new Binary(uuid.asBuffer()),
    });

    expect(result).not.toBeNull();
  });

  afterEach(async () => {
    await uuids.deleteMany({ version: 4 });
    await connection.client.close();
  });
});
