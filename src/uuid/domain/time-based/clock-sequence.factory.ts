import { UuidV1Repository } from './uuid-v1.repository';
import { RandomBytesProvider } from '../random-bytes.provider';
import { ClockSequence } from './clock-sequence';
import { UuidTime } from './uuid-time';
import { Node } from './node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClockSequenceFactory {
  constructor(
    private readonly uuidV1Repository: UuidV1Repository,
    private readonly randomBytesProvider: RandomBytesProvider,
  ) {}

  async create(time: UuidTime, node: Node): Promise<ClockSequence> {
    const uuid = await this.uuidV1Repository.getLastCreatedUuidByNode(node);

    if (uuid === undefined) {
      const bytes = await this.randomBytesProvider.generate(2);
      return ClockSequence.fromNumber(bytes.readUInt16BE() & 0x3fff);
    }

    if (time.compare(uuid.time) === -1) {
      return uuid.clockSequence.increment();
    }

    return uuid.clockSequence;
  }
}
