import { UuidServiceInterface } from '../src/uuid/domain/uuid-service.interface';
import { UuidFormats } from '../src/uuid/domain/uuid-formats';

export type UuidMethod<T extends UuidFormats> = `as${Capitalize<T>}`;
export type UuidMock = {
  [P in UuidFormats as UuidMethod<P>]: jest.Mock<string>;
};

export type UuidServiceMock = Partial<
  Record<keyof UuidServiceInterface, jest.Mock<UuidMock>>
>;

export type UuidFormatMap = Record<UuidFormats, string>;

export interface ErrorResponse {
  statusCode: string;
  message: string[];
}
