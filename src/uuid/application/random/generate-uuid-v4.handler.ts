import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateUuidV4Command } from './generate-uuid-v4.command';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidV4 } from '../../domain/random/uuid-v4';
import { RandomBytesProvider } from '../../domain/random-bytes.provider';
import { UuidV4Repository } from '../../domain/random/uuid-v4.repository';

@CommandHandler(GenerateUuidV4Command)
export class GenerateUuidV4Handler
  implements ICommandHandler<GenerateUuidV4Command, GenerateUuidViewModel>
{
  constructor(
    private readonly randomBytesProvider: RandomBytesProvider,
    private readonly formatter: UuidFormatter,
    private readonly uuidV4Repository: UuidV4Repository,
  ) {}

  async execute(
    command: GenerateUuidV4Command,
  ): Promise<GenerateUuidViewModel> {
    const uuid = await UuidV4.create(this.randomBytesProvider);

    void this.uuidV4Repository.save(uuid);

    return new GenerateUuidViewModel(
      this.formatter.format(uuid, command.format),
    );
  }
}
