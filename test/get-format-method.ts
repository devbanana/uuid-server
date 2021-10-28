import { UuidFormats } from '../src/uuid/application/generate-uuid-v1.command';

export type UuidMethod<T extends UuidFormats> = `as${Capitalize<T>}`;

export function getFormatMethod<T extends UuidFormats>(
  property: T,
): UuidMethod<T> {
  return `as${property[0].toUpperCase()}${property
    .slice(1)
    .toLowerCase()}` as UuidMethod<T>;
}
