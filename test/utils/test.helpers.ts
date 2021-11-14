import { ErrorResponse, UuidFormatMap, UuidMethod } from './test.types';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { UuidModule } from '../../src/uuid/uuid.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { Uuid } from '../../src/uuid/domain/uuid';
import { UuidFormats } from '../../src/uuid/domain/uuid-formats';
import { ConfigModule } from '@nestjs/config';
import { GenerateUuidViewModel } from '../../src/uuid/application/generate-uuid.view-model';

type ProviderOverride = { provider: unknown; override: unknown };

export async function initiateApp(
  overrides: ProviderOverride[],
): Promise<INestApplication> {
  const builder: TestingModuleBuilder = Test.createTestingModule({
    imports: [UuidModule, ConfigModule.forRoot()],
  });

  for (const override of overrides) {
    typeof override.override === 'function'
      ? builder.overrideProvider(override.provider).useClass(override.override)
      : builder.overrideProvider(override.provider).useValue(override.override);
  }

  const module: TestingModule = await builder.compile();

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

export function isGenerateUuidResponse(
  body: unknown,
): body is GenerateUuidViewModel {
  return (
    typeof body === 'object' &&
    body !== null &&
    'uuid' in body &&
    typeof (<{ uuid: unknown }>body).uuid === 'string'
  );
}
