import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateUuidV3Command } from './generate-uuid-v3.command';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidNamespace } from '../../domain/name-based/uuid-namespace';
import { UuidName } from '../../domain/name-based/uuid-name';
import { Md5HashProvider } from '../../domain/name-based/md5-hash.provider';
import { UuidV3 } from '../../domain/name-based/uuid-v3';

@CommandHandler(GenerateUuidV3Command)
export class GenerateUuidV3Handler
  implements ICommandHandler<GenerateUuidV3Command, GenerateUuidViewModel>
{
  constructor(
    private readonly md5HashProvider: Md5HashProvider,
    private readonly formatter: UuidFormatter,
  ) {}

  async execute(
    command: GenerateUuidV3Command,
  ): Promise<GenerateUuidViewModel> {
    const uuid = await UuidV3.create(
      UuidNamespace.isPredefined(command.namespace)
        ? UuidNamespace.fromPredefined(command.namespace)
        : UuidNamespace.fromRfc4122(command.namespace),
      UuidName.fromString(command.name),
      this.md5HashProvider,
    );

    return new GenerateUuidViewModel(
      this.formatter.format(uuid, command.format),
    );
  }
}
