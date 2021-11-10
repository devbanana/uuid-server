import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateUuidV5Command } from './generate-uuid-v5.command';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidNamespace } from '../../domain/name-based/uuid-namespace';
import { UuidName } from '../../domain/name-based/uuid-name';
import { Sha1HashProvider } from '../../domain/name-based/sha1-hash.provider';
import { UuidV5 } from '../../domain/name-based/uuid-v5';

@CommandHandler(GenerateUuidV5Command)
export class GenerateUuidV5Handler
  implements ICommandHandler<GenerateUuidV5Command, GenerateUuidViewModel>
{
  constructor(
    private readonly sha1HashProvider: Sha1HashProvider,
    private readonly formatter: UuidFormatter,
  ) {}

  async execute(
    command: GenerateUuidV5Command,
  ): Promise<GenerateUuidViewModel> {
    const uuid = await UuidV5.create(
      UuidNamespace.isPredefined(command.namespace)
        ? UuidNamespace.fromPredefined(command.namespace)
        : UuidNamespace.fromRfc4122(command.namespace),
      UuidName.fromString(command.name),
      this.sha1HashProvider,
    );

    return new GenerateUuidViewModel(
      this.formatter.format(uuid, command.format),
    );
  }
}
