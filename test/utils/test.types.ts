import { UuidFormats } from '../../src/uuid/domain/uuid-formats';

export type UuidMethod<T extends UuidFormats> = `as${Capitalize<T>}`;
export type UuidMock = {
  [P in UuidFormats as UuidMethod<P>]: jest.Mock<string>;
};

export type UuidFormatMap = Record<UuidFormats, string>;

export interface ErrorResponse {
  statusCode: string;
  message: string[];
}
