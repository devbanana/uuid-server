import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UuidServiceInterface } from '../../domain/uuid-service.interface';
import { UuidTime } from '../../domain/time-based/uuid-time';
import { ClockSequence } from '../../domain/time-based/clock-sequence';
import { Node } from '../../domain/time-based/node';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { UuidFormatter } from '../../domain/uuid-formatter';

@CommandHandler(GenerateUuidV1Command)
export class GenerateUuidV1Handler
  implements ICommandHandler<GenerateUuidV1Command, GenerateUuidViewModel>
{
  constructor(
    @Inject('UuidServiceInterface')
    private readonly uuidService: UuidServiceInterface,
    private readonly formatter: UuidFormatter,
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

    const uuid = this.uuidService.generateV1(time, clockSeq, node);

    return Promise.resolve(
      new GenerateUuidViewModel(this.formatter.format(uuid, command.format)),
    );
  }
}
