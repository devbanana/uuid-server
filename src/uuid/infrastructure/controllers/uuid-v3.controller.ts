import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { GenerateUuidV3Command } from '../../application/name-based/generate-uuid-v3.command';
import { GenerateUuidViewModel } from '../../application/generate-uuid.view-model';

@Controller('uuid/v3')
@ApiTags('uuid-v3')
export class UuidV3Controller {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Generate a V3 UUID.
   */
  @Get('generate')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(GenerateUuidViewModel) },
        {
          properties: {
            uuid: { example: 'd4970169-f9a4-31c9-a11b-08609bb119c2' },
          },
        },
      ],
    },
  })
  generate(
    @Query() command: GenerateUuidV3Command,
  ): Promise<GenerateUuidViewModel> {
    return this.commandBus.execute<
      GenerateUuidV3Command,
      GenerateUuidViewModel
    >(command);
  }
}
