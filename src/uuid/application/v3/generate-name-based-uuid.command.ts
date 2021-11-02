import { PredefinedNamespaces } from '../../domain/name-based/predefined-namespaces';
import { UuidFormats } from '../../domain/uuid-formats';
import { GenerateUuidCommand } from '../generate-uuid.command';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, MinLength, ValidateIf } from 'class-validator';

export abstract class GenerateNameBasedUuidCommand extends GenerateUuidCommand {
  /**
   * The namespace from which to generate the UUID.
   *
   * May either be an RFC4122-formatted UUID (with no version requirements), or a predefined
   * namespace: one of ns:dns, ns:url, ns:oid, or ns:x500.
   */
  @ApiProperty({
    oneOf: [
      {
        type: 'string',
        format: 'uuid',
        description: 'Valid RFC4122 UUID',
        pattern:
          '^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$',
      },
      {
        type: 'string',
        enum: Object.values(PredefinedNamespaces),
        description: 'Predefined namespace',
      },
    ],
  })
  @ValidateIf(
    (object, value) =>
      !Object.values(PredefinedNamespaces).includes(
        value as PredefinedNamespaces,
      ),
  )
  @IsUUID('all', {
    message:
      'Namespace must either be an RFC4122-formatted UUID, or a predefined' +
      ' namespace (ns:dns, ns:url, ns:oid, ns:x500)',
  })
  readonly namespace: PredefinedNamespaces | string;

  /**
   * The name from which to generate the UUID.
   *
   * This can be any sequence of bytes.
   */
  @MinLength(1, { message: 'Name must be provided and not empty' })
  readonly name: string;

  constructor(
    namespace: PredefinedNamespaces | string,
    name: string,
    format?: UuidFormats,
  ) {
    super(format);
    this.namespace = namespace;
    this.name = name;
  }
}
