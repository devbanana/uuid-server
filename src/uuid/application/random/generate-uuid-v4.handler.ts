import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateUuidV4Command } from './generate-uuid-v4.command';
import { GenerateUuidViewModel } from '../generate-uuid.view-model';
import { Inject } from '@nestjs/common';
import { UuidServiceInterface } from '../../domain/uuid-service.interface';
import { UuidFormatter } from '../../domain/uuid-formatter';

@CommandHandler(GenerateUuidV4Command)
export class GenerateUuidV4Handler
  implements ICommandHandler<GenerateUuidV4Command, GenerateUuidViewModel>
{
  constructor(
    @Inject('UuidServiceInterface')
    private readonly uuidService: UuidServiceInterface,
    private readonly formatter: UuidFormatter,
  ) {}

  async execute(
    command: GenerateUuidV4Command,
  ): Promise<GenerateUuidViewModel> {
    const uuid = await this.uuidService.generateV4();

    return new GenerateUuidViewModel(
      this.formatter.format(uuid, command.format),
    );
  }
}
