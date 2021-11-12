import { UuidTime } from './uuid-time';
import { Clock } from './clock';
import { UuidV1Repository } from './uuid-v1.repository';
import { Node } from './node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UuidTimeFactory {
  constructor(
    private readonly clock: Clock,
    private readonly uuidV1Repository: UuidV1Repository,
  ) {}

  async create(timeString: string | undefined, node: Node): Promise<UuidTime> {
    let time =
      timeString === undefined
        ? UuidTime.fromMilliseconds(this.clock.now())
        : UuidTime.fromString(timeString);

    const uuid = await this.uuidV1Repository.getLastUuidByTimeAndNode(
      time,
      node,
    );

    if (uuid !== undefined) {
      if (uuid.time.nsOffset === 999900) {
        throw new Error(
          'Too many UUIDs generated for this time. Please wait and try again.',
        );
      }

      time = time.withAddedNanoseconds(uuid.time.nsOffset + 100);
    }

    return time;
  }
}
