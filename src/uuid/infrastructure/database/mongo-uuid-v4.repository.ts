import { Injectable } from '@nestjs/common';
import { UuidV4Repository } from '../../domain/random/uuid-v4.repository';
import { DatabaseConnection } from './database.connection';
import { UuidV4Schema } from './schemas/uuid-v4.schema';
import { UuidV4 } from '../../domain/random/uuid-v4';
import { Binary, Collection } from 'mongodb';

@Injectable()
export class MongoUuidV4Repository implements UuidV4Repository {
  private uuids: Collection<UuidV4Schema>;

  constructor(private readonly connection: DatabaseConnection) {
    this.uuids = connection.db.collection<UuidV4Schema>('uuids');
  }

  async save(uuid: UuidV4): Promise<void> {
    await this.uuids.insertOne({
      type: 'rfc4122',
      version: 4,
      uuid: new Binary(uuid.asBuffer()),
    });
  }
}
