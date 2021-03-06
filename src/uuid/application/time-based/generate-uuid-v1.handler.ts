import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidV1 } from '../../domain/time-based/uuid-v1';
import { UuidTimeFactory } from '../../domain/time-based/uuid-time.factory';
import { NodeFactory } from '../../domain/time-based/node.factory';
import { ClockSequenceFactory } from '../../domain/time-based/clock-sequence.factory';
import { UuidV1Repository } from '../../domain/time-based/uuid-v1.repository';

@CommandHandler(GenerateUuidV1Command)
export class GenerateUuidV1Handler
  implements ICommandHandler<GenerateUuidV1Command, GenerateUuidViewModel>
{
  constructor(
    private readonly timeFactory: UuidTimeFactory,
    private readonly clockSequenceFactory: ClockSequenceFactory,
    private readonly nodeFactory: NodeFactory,
    private readonly formatter: UuidFormatter,
    private readonly uuidV1Repository: UuidV1Repository,
  ) {}

  async execute(
    command: GenerateUuidV1Command,
  ): Promise<GenerateUuidViewModel> {
    const node = await this.nodeFactory.create(command.node);
    const time = await this.timeFactory.create(command.time, node);
    const clockSequence = await this.clockSequenceFactory.create(time, node);

    const uuid = UuidV1.create(time, clockSequence, node);

    // Intentionally allow to pass through without awaiting since we don't need the result
    void this.uuidV1Repository.save(uuid);

    return new GenerateUuidViewModel(
      this.formatter.format(uuid, command.format),
    );
  }
}
