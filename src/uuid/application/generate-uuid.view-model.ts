import { ApiProperty } from '@nestjs/swagger';

export class GenerateUuidViewModel {
  /**
   * The generated UUID, provided in the chosen format.
   *
   * @example 716764e0-3884-11ec-9c7c-0bb5416f760e
   */
  @ApiProperty({
    format: 'uuid',
  })
  public readonly uuid: string;

  constructor(uuid: string) {
    this.uuid = uuid;
  }
}
