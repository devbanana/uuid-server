import { UuidV1 } from '../../domain/time-based/uuid-v1';
import { IEvent } from '@nestjs/cqrs';

export class TimeBasedUuidGeneratedEvent implements IEvent {
  constructor(readonly uuid: UuidV1) {}
}
