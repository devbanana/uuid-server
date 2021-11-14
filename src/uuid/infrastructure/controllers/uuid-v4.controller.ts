import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { GenerateUuidV4Command } from '../../application/random/generate-uuid-v4.command';
import { GenerateUuidViewModel } from '../../application/generate-uuid.view-model';

@Controller('uuid/v4')
@ApiTags('uuid-v4')
export class UuidV4Controller {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Generate a V4 UUID.
   */
  @Get('generate')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(GenerateUuidViewModel) },
        {
          properties: {
            uuid: { example: '5839b05b-97d0-4ba3-8d09-42e05d4e9eff' },
          },
        },
      ],
    },
  })
  generate(
    @Query() command: GenerateUuidV4Command,
  ): Promise<GenerateUuidViewModel> {
    return this.commandBus.execute<
      GenerateUuidV4Command,
      GenerateUuidViewModel
    >(command);
  }
}
