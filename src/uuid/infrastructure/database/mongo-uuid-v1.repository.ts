import { Injectable } from '@nestjs/common';
import { DatabaseConnection } from './database.connection';
import { UuidV1Repository } from '../../domain/time-based/uuid-v1.repository';
import { Node } from '../../domain/time-based/node';
import { UuidV1 } from '../../domain/time-based/uuid-v1';
import { UuidTime } from '../../domain/time-based/uuid-time';
import { Collection, Document } from 'mongodb';
import { ClockSequence } from '../../domain/time-based/clock-sequence';
import { OnEvent } from '@nestjs/event-emitter';

export interface UuidSchema extends Document {
  type: string;
  version: number;
  date: Date;
  nsOffset: number;
  clockSequence: number;
  node: number;
}

@Injectable()
export class MongoUuidV1Repository implements UuidV1Repository {
  private uuids: Collection<UuidSchema>;

  constructor(private connection: DatabaseConnection) {
    this.uuids = connection.db.collection('uuids');
  }

  async countUuidsByNode(node: Node): Promise<number> {
    const result = await this.uuids
      .aggregate<{ numUuids: number }>([
        { $match: { version: 1, node: node.asNumber() } },
        { $count: 'numUuids' },
      ])
      .next();
    if (result === null) {
      return 0;
    }

    return result.numUuids;
  }

  async getLastCreatedUuidByNode(node: Node): Promise<UuidV1 | undefined> {
    const result = await this.uuids
      .aggregate<UuidSchema>([
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
      .aggregate<UuidSchema>([
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

  private static createUuidFromSchema(result: UuidSchema): UuidV1 {
    return UuidV1.create(
      UuidTime.fromDate(result.date).withAddedNanoseconds(result.nsOffset),
      ClockSequence.fromNumber(result.clockSequence),
      Node.fromNumber(result.node),
    );
  }

  @OnEvent('uuid.v1.generated')
  async save(uuid: UuidV1): Promise<void> {
    await this.uuids.insertOne({
      type: 'rfc4122',
      version: 1,
      date: uuid.time.date,
      nsOffset: uuid.time.nsOffset,
      clockSequence: uuid.clockSequence.asNumber(),
      node: uuid.node.asNumber(),
    });
  }
}
