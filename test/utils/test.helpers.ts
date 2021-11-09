import {
  ErrorResponse,
  UuidFormatMap,
  UuidMethod,
  UuidMock,
} from './test.types';
import { OverrideBy, Test, TestingModule } from '@nestjs/testing';
import { UuidModule } from '../../src/uuid/uuid.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { Uuid } from '../../src/uuid/domain/uuid';
import { UuidFormats } from '../../src/uuid/domain/uuid-formats';
import { RandomBytesProvider } from '../../src/uuid/domain/random-bytes.provider';
import { Buffer } from 'buffer';

export async function initiateApp(
  value: unknown,
  provider: unknown = 'UuidServiceInterface',
): Promise<INestApplication> {
  const builder: OverrideBy = Test.createTestingModule({
    imports: [UuidModule],
  }).overrideProvider(provider);

  const module: TestingModule = await (typeof provider === 'string'
    ? builder.useValue(value)
    : builder.useClass(value)
  ).compile();

  const app: INestApplication = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, stopAtFirstError: true }),
  );
  await app.init();

  return app;
}

export function createRequest(
  app: INestApplication,
): supertest.SuperTest<supertest.Test> {
  return supertest(app.getHttpServer());
}

export async function closeApp(app: INestApplication): Promise<void> {
  await app.close();
  jest.clearAllMocks();
}

export function generateUuids(uuid: Uuid): UuidFormatMap {
  return {
    rfc4122: uuid.asRfc4122(),
    base32: uuid.asBase32(),
    base58: uuid.asBase58(),
    base64: uuid.asBase64(),
    binary: uuid.asBinary(),
    number: uuid.asNumber().toString(),
  };
}

export function createMockUuid(uuids: UuidFormatMap): UuidMock {
  return {
    asRfc4122: jest.fn(() => uuids.rfc4122),
    asBase32: jest.fn(() => uuids.base32),
    asBase58: jest.fn(() => uuids.base58),
    asBase64: jest.fn(() => uuids.base64),
    asBinary: jest.fn(() => uuids.binary),
    asNumber: jest.fn(() => uuids.number),
  };
}

export function getFormatMethod<T extends UuidFormats>(
  property: T,
): UuidMethod<T> {
  return `as${property[0].toUpperCase()}${property
    .slice(1)
    .toLowerCase()}` as UuidMethod<T>;
}

export function isErrorResponse(body: unknown): body is ErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'statusCode' in body &&
    'message' in body
  );
}

export const NO_ERROR_RESPONSE_MESSAGE = 'Expected an error response';

export class FakeRandomBytesProvider extends RandomBytesProvider {
  constructor(private data?: Buffer) {
    super();
  }

  set bytes(data: Buffer) {
    this.data = data;
  }

  generate(_bytes: number): Promise<Buffer> {
    if (this.data === undefined) throw new Error('Random bytes not set');

    return Promise.resolve(this.data);
  }
}
