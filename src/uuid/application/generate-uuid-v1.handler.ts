import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UuidServiceInterface } from '../domain/uuid-service.interface';
import { UuidTime } from '../domain/uuid-time';
import { ClockSequence } from '../domain/clock-sequence';
import { Node } from '../domain/node';
import { UuidV1 } from '../domain/uuid-v1';
import { GenerateUuidViewModel } from './generate-uuid.view-model';
import { UuidFormats } from '../domain/uuid-formats';

@CommandHandler(GenerateUuidV1Command)
export class GenerateUuidV1Handler
  implements ICommandHandler<GenerateUuidV1Command, GenerateUuidViewModel>
{
  constructor(
    @Inject('UuidServiceInterface')
    private readonly uuidService: UuidServiceInterface,
  ) {}

  execute(command: GenerateUuidV1Command): Promise<GenerateUuidViewModel> {
    const time =
      command.time === undefined
        ? undefined
        : UuidTime.fromString(command.time);
    const clockSeq =
      command.clockSeq === undefined
        ? undefined
        : ClockSequence.fromNumber(command.clockSeq);
    const node =
      command.node === undefined ? undefined : Node.fromString(command.node);

    const uuid = this.uuidService.generate(time, clockSeq, node);

    return Promise.resolve(
      new GenerateUuidViewModel(GenerateUuidV1Handler.getFormat(command, uuid)),
    );
  }

  private static getFormat(
    command: GenerateUuidV1Command,
    uuid: UuidV1,
  ): string {
    switch (command.format) {
      case UuidFormats.Base32:
        return uuid.asBase32();

      case UuidFormats.Base58:
        return uuid.asBase58();

      case UuidFormats.Base64:
        return uuid.asBase64();

      case UuidFormats.Number:
        return uuid.asNumber().toString();

      case UuidFormats.Binary:
        return uuid.asBinary();

      default:
        return uuid.asRfc4122();
    }
  }
}
