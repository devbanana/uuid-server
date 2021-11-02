import { Controller, Get, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GenerateUuidV1Command } from '../application/time-based/generate-uuid-v1.command';
import { GenerateUuidViewModel } from '../application/generate-uuid.view-model';
import { ApiTags } from '@nestjs/swagger';

@Controller('uuid/v1')
@ApiTags('uuid-v1')
export class UuidV1Controller {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Generate a V1 UUID.
   */
  @Get('generate')
  async generate(
    @Query() command: GenerateUuidV1Command,
  ): Promise<GenerateUuidViewModel> {
    return await this.commandBus.execute<
      GenerateUuidV1Command,
      GenerateUuidViewModel
    >(command);
  }
}
