import {
  closeApp,
  createRequest,
  generateUuids,
  initiateApp,
} from '../utils/test.helpers';
import { UuidV4 } from '../../src/uuid/domain/random/uuid-v4';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { UuidFormats } from '../../src/uuid/domain/uuid-formats';
import { RandomBytesProvider } from '../../src/uuid/domain/random-bytes.provider';
import { FakeRandomBytesProvider } from '../utils/test.fakes';
import { DatabaseConnection } from '../../src/uuid/infrastructure/database/database.connection';

const uuids = generateUuids(
  UuidV4.fromRfc4122('0af1d462-a62e-42f8-87d8-5b3c04c13800'),
);

describe('Random UUIDs', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let connection: DatabaseConnection;

  beforeEach(async () => {
    app = await initiateApp([
      { provider: RandomBytesProvider, override: FakeRandomBytesProvider },
    ]);
    request = createRequest(app);

    app
      .get<RandomBytesProvider, FakeRandomBytesProvider>(RandomBytesProvider)
      .addRandomValue(Buffer.from('0af1d462a62e52f8c7d85b3c04c13800', 'hex'));

    connection = app.get<DatabaseConnection>(DatabaseConnection);
  });

  it('generates a V4 UUID', async () => {
    await request
      .get('/uuid/v4/generate')
      .expect(200)
      .expect({ uuid: uuids.rfc4122 });

    const count = await connection.db
      .collection('uuids')
      .countDocuments({ version: 4 });
    expect(count).toBe(1);
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
    await connection.db.collection('uuids').deleteMany({ version: 4 });
    await closeApp(app);
  });
});
