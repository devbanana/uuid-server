import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateUuidV5Command } from './generate-uuid-v5.command';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { UuidServiceInterface } from '../../domain/uuid-service.interface';
import { UuidFormatter } from '../../domain/uuid-formatter';
import { UuidNamespace } from '../../domain/name-based/uuid-namespace';
import { UuidName } from '../../domain/name-based/uuid-name';
import { Inject } from '@nestjs/common';

@CommandHandler(GenerateUuidV5Command)
export class GenerateUuidV5Handler
  implements ICommandHandler<GenerateUuidV5Command, GenerateUuidViewModel>
{
  constructor(
    @Inject('UuidServiceInterface')
    private readonly uuidService: UuidServiceInterface,
    private readonly formatter: UuidFormatter,
  ) {}

  async execute(
    command: GenerateUuidV5Command,
  ): Promise<GenerateUuidViewModel> {
    const uuid = await this.uuidService.generateV5(
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
