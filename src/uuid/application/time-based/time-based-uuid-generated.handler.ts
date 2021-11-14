import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TimeBasedUuidGeneratedEvent } from './time-based-uuid-generated.event';
import { UuidV1Repository } from '../../domain/time-based/uuid-v1.repository';

@EventsHandler(TimeBasedUuidGeneratedEvent)
export class TimeBasedUuidGeneratedHandler
  implements IEventHandler<TimeBasedUuidGeneratedEvent>
{
  constructor(private readonly uuidV1Repository: UuidV1Repository) {}

  async handle(event: TimeBasedUuidGeneratedEvent): Promise<void> {
    await this.uuidV1Repository.save(event.uuid);
  }
}
