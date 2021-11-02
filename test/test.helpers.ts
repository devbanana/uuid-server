import {
  UuidFormatMap,
  UuidMethod,
  UuidMock,
  UuidServiceMock,
} from './test.types';
import { Test, TestingModule } from '@nestjs/testing';
import { UuidModule } from '../src/uuid/uuid.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { Uuid } from '../src/uuid/domain/uuid';
import { UuidFormats } from '../src/uuid/domain/uuid-formats';

export async function initiateApp(
  uuidService: UuidServiceMock,
): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [UuidModule],
  })
    .overrideProvider('UuidServiceInterface')
    .useValue(uuidService)
    .compile();

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
