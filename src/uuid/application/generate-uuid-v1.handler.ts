import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UuidServiceInterface } from '../domain/uuid-service.interface';
import { UuidTime } from '../domain/uuid-time';

@CommandHandler(GenerateUuidV1Command)
export class GenerateUuidV1Handler
  implements ICommandHandler<GenerateUuidV1Command, string>
{
  constructor(
    @Inject('UuidServiceInterface')
    private readonly uuidService: UuidServiceInterface,
  ) {}

  execute(command: GenerateUuidV1Command): Promise<string> {
    const time = command.time ? UuidTime.fromString(command.time) : undefined;

    return Promise.resolve(this.uuidService.generate(time).asString());
  }
}
