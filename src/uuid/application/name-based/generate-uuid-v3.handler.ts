import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateUuidV3Command } from './generate-uuid-v3.command';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { Inject } from '@nestjs/common';
import { UuidServiceInterface } from '../../domain/uuid-service.interface';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidNamespace } from '../../domain/name-based/uuid-namespace';
import { UuidName } from '../../domain/name-based/uuid-name';

@CommandHandler(GenerateUuidV3Command)
export class GenerateUuidV3Handler
  implements ICommandHandler<GenerateUuidV3Command, GenerateUuidViewModel>
{
  constructor(
    @Inject('UuidServiceInterface')
    private readonly uuidService: UuidServiceInterface,
    private readonly formatter: UuidFormatter,
  ) {}

  async execute(
    command: GenerateUuidV3Command,
  ): Promise<GenerateUuidViewModel> {
    const uuid = await this.uuidService.generateV3(
      UuidNamespace.isPredefined(command.namespace)
        ? UuidNamespace.fromPredefined(command.namespace)
        : UuidNamespace.fromRfc4122(command.namespace),
      UuidName.fromString(command.name),
    );

    return new GenerateUuidViewModel(
      this.formatter.format(uuid, command.format),
    );
  }
}
