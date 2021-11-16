import { Injectable } from '@nestjs/common';
import { DatabaseConnection } from './database.connection';
import { UuidV1Repository } from '../../domain/time-based/uuid-v1.repository';
import { Node } from '../../domain/time-based/node';
import { UuidV1 } from '../../domain/time-based/uuid-v1';
import { UuidTime } from '../../domain/time-based/uuid-time';
import { Binary, Collection } from 'mongodb';
import { UuidV1Schema } from './schemas/uuid-v1.schema';
import { Clock } from '../../domain/time-based/clock';

@Injectable()
export class MongoUuidV1Repository implements UuidV1Repository {
  private uuids: Collection<UuidV1Schema>;

  constructor(
    private readonly connection: DatabaseConnection,
    private readonly clock: Clock,
  ) {
    this.uuids = connection.db.collection('uuids');
  }

  countUuidsByNode(node: Node): Promise<number> {
    return this.uuids.countDocuments({ version: 1, node: node.asNumber() });
  }

  async getLastCreatedUuidByNode(node: Node): Promise<UuidV1 | undefined> {
    const result = await this.uuids
      .aggregate<UuidV1Schema>([
        { $match: { version: 1, node: node.asNumber() } },
        { $sort: { _id: -1 } },
      ])
      .limit(1)
      .next();

    if (result === null) {
      return undefined;
    }

    return MongoUuidV1Repository.createUuidFromSchema(result);
  }

  async getLastUuidByTimeAndNode(
    time: UuidTime,
    node: Node,
  ): Promise<UuidV1 | undefined> {
    const result = await this.uuids
      .aggregate<UuidV1Schema>([
        { $match: { version: 1, date: time.date, node: node.asNumber() } },
        { $sort: { nsOffset: -1 } },
      ])
      .limit(1)
      .next();

    if (result === null) {
      return undefined;
    }

    return MongoUuidV1Repository.createUuidFromSchema(result);
  }

  private static createUuidFromSchema(result: UuidV1Schema): UuidV1 {
    return UuidV1.fromBuffer(result.uuid.buffer);
  }

  async save(uuid: UuidV1): Promise<void> {
    await this.uuids.insertOne({
      type: 'rfc4122',
      version: 1,
      uuid: new Binary(uuid.asBuffer()),
      created: new Date(this.clock.now()),
      date: uuid.time.date,
      nsOffset: uuid.time.nsOffset,
      clockSequence: uuid.clockSequence.asNumber(),
      node: uuid.node.asNumber(),
    });
  }
}
