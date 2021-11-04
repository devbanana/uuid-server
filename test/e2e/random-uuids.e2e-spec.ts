import { UuidServiceInterface } from '../../src/uuid/domain/uuid-service.interface';
import { UuidMock } from '../utils/test.types';
import {
  closeApp,
  createMockUuid,
  createRequest,
  generateUuids,
  initiateApp,
} from '../utils/test.helpers';
import { UuidV4 } from '../../src/uuid/domain/random/uuid-v4';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { UuidFormats } from '../../src/uuid/domain/uuid-formats';

const uuids = generateUuids(
  UuidV4.fromRfc4122('1457e235-73d2-4083-b933-908abd497858'),
);

const uuidService: Record<
  keyof Pick<UuidServiceInterface, 'generateV4'>,
  jest.Mock<UuidMock>
> = {
  generateV4: jest.fn(() => createMockUuid(uuids)),
};

describe('uuid-v4', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    app = await initiateApp(uuidService);
    request = createRequest(app);
  });

  it('generates a V4 UUID', async () => {
    await request
      .get('/uuid/v4/generate')
      .expect(200)
      .expect({ uuid: uuids.rfc4122 });

    expect(uuidService.generateV4).toHaveBeenCalled();
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
        .get(`/uuid/v4/generate?format=${format}`)
        .expect(200)
        .expect({ uuid: uuids[format] });
    },
  );

  afterEach(async () => {
    await closeApp(app);
  });
});
