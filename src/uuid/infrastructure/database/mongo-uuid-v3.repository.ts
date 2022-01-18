import { Injectable } from '@nestjs/common';
import { UuidV3Repository } from '../../domain/name-based/uuid-v3.repository';
import { Collection } from 'mongodb';
import { UuidV3Schema } from './schemas/uuid-v3.schema';
import { DatabaseConnection } from './database.connection';
import { Clock } from '../../domain/time-based/clock';
import { UuidV3 } from '../../domain/name-based/uuid-v3';
import { Binary } from 'mongodb';

@Injectable()
export class MongoUuidV3Repository implements UuidV3Repository {
  private uuids: Collection<UuidV3Schema>;

  constructor(
    private readonly connection: DatabaseConnection,
    private readonly clock: Clock,
  ) {
    this.uuids = connection.db.collection<UuidV3Schema>('uuids');
  }

  async save(uuid: UuidV3): Promise<void> {
    await this.uuids.insertOne({
      type: 'rfc4122',
      version: 3,
      uuid: new Binary(uuid.asBuffer()),
      created: new Date(this.clock.now()),
    });
  }
}
