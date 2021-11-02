import {
  closeApp,
  createMockUuid,
  createRequest,
  generateUuids,
  initiateApp,
  isErrorResponse,
  NO_ERROR_RESPONSE_MESSAGE,
} from './test.helpers';
import { UuidServiceMock } from './test.types';
import { UuidV3 } from '../src/uuid/domain/name-based/uuid-v3';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UuidNamespace } from '../src/uuid/domain/name-based/uuid-namespace';
import { UuidName } from '../src/uuid/domain/name-based/uuid-name';
import { PredefinedNamespaces } from '../src/uuid/domain/name-based/predefined-namespaces';
import { UuidFormats } from '../src/uuid/domain/uuid-formats';

const uuid = UuidV3.fromRfc4122('d4970169-f9a4-31c9-a11b-08609bb119c2');
const uuids = generateUuids(uuid);
const mockUuid = createMockUuid(uuids);

const uuidService: UuidServiceMock = {
  generateV3: jest.fn(() => mockUuid),
};

describe('UuidV3', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    app = await initiateApp(uuidService);
    request = createRequest(app);
  });

  it('generates a V3 UUID', async () => {
    const namespace = `e9cd4085-931c-4581-a174-eeb825a1de8d`;
    const name = `foo`;
    await request
      .get(`/uuid/v3/generate?namespace=${namespace}&name=${name}`)
      .expect(200);

    expect(uuidService.generateV3).toHaveBeenCalledTimes(1);
    expect(uuidService.generateV3).toHaveBeenCalledWith(
      UuidNamespace.fromRfc4122(namespace),
      UuidName.fromString(name),
    );
  });

  it.each`
    namespace                    | name
    ${PredefinedNamespaces.Dns}  | ${'devbanana.me'}
    ${PredefinedNamespaces.Url}  | ${'https://www.devbanana.me'}
    ${PredefinedNamespaces.Oid}  | ${'1.3.6.1'}
    ${PredefinedNamespaces.X500} | ${'CN=Bob,C=US'}
  `(
    'can generate a UUID with the $namespace namespace',
    async ({
      namespace,
      name,
    }: {
      namespace: PredefinedNamespaces;
      name: string;
    }) => {
      await request
        .get(`/uuid/v3/generate?namespace=${namespace}&name=${name}`)
        .expect(200);

      expect(uuidService.generateV3).toHaveBeenCalledTimes(1);
      expect(uuidService.generateV3).toHaveBeenCalledWith(
        UuidNamespace.fromPredefined(namespace),
        UuidName.fromString(name),
      );
    },
  );

  it('rejects an invalid predefined namespace', async () => {
    const response = await request
      .get('/uuid/v3/generate?namespace=ns:foo&name=bar')
      .expect(400);

    if (!isErrorResponse(response.body)) {
      fail(NO_ERROR_RESPONSE_MESSAGE);
    }

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message[0]).toContain(
      'Namespace must either be an RFC4122-formatted UUID, or a predefined namespace',
    );
  });

  it('rejects a non-RFC4122 namespace', async () => {
    const response = await request
      .get('/uuid/v3/generate?namespace=8TeQn4u7anLk&name=foo')
      .expect(400);

    if (!isErrorResponse(response.body)) {
      fail(NO_ERROR_RESPONSE_MESSAGE);
    }

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message[0]).toContain(
      'Namespace must either be an RFC4122-formatted UUID,' +
        ' or a predefined namespace',
    );
  });

  it('requires a name to be provided', async () => {
    const response = await request
      .get('/uuid/v3/generate?namespace=ns:dns')
      .expect(400);

    if (!isErrorResponse(response.body)) {
      fail(NO_ERROR_RESPONSE_MESSAGE);
    }

    expect(response.body.message[0]).toContain(
      'Name must be provided and not empty',
    );
  });

  it('requires a name to have at least 1 character', async () => {
    const response = await request
      .get('/uuid/v3/generate?namespace=ns:dns&name=')
      .expect(400);

    if (!isErrorResponse(response.body)) {
      fail(NO_ERROR_RESPONSE_MESSAGE);
    }

    expect(response.body.message[0]).toContain(
      'Name must be provided and not empty',
    );
  });

  it.each`
    format
    ${'base32'}
    ${'base58'}
    ${'base64'}
    ${'binary'}
    ${'number'}
  `(
    'can format the UUID as $format',
    async ({ format }: { format: UuidFormats }) => {
      await request
        .get(
          `/uuid/v3/generate?namespace=ns:dns&name=devbanana.me&format=${format}`,
        )
        .expect(200)
        .expect({ uuid: uuids[format] });
    },
  );

  afterEach(async () => {
    await closeApp(app);
  });
});
