import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { GenerateUuidV5Command } from '../application/name-based/generate-uuid-v5.command';
import { GenerateUuidViewModel } from '../application/generate-uuid.view-model';

@Controller('uuid/v5')
@ApiTags('uuid-v5')
export class UuidV5Controller {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Generate a V5 UUID.
   */
  @Get('generate')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(GenerateUuidViewModel) },
        {
          properties: {
            uuid: { example: '0cabaa1d-1c4d-5cf5-8938-b56ac03409f4' },
          },
        },
      ],
    },
  })
  generate(
    @Query() command: GenerateUuidV5Command,
  ): Promise<GenerateUuidViewModel> {
    return this.commandBus.execute<
      GenerateUuidV5Command,
      GenerateUuidViewModel
    >(command);
  }
}
