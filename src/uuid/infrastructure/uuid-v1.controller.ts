import { Controller, Get } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GenerateUuidV1Command } from '../application/generate-uuid-v1.command';

interface GenerateUuidResponse {
  uuid: string;
}

@Controller('uuid/v1')
export class UuidV1Controller {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('generate')
  async generate(): Promise<GenerateUuidResponse> {
    const uuid = await this.commandBus.execute<GenerateUuidV1Command, string>(
      new GenerateUuidV1Command(),
    );
    return { uuid };
  }
}
