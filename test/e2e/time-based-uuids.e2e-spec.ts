import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  closeApp,
  createRequest,
  initiateApp,
  isErrorResponse,
  isGenerateUuidResponse,
  NO_ERROR_RESPONSE_MESSAGE,
} from '../utils/test.helpers';
import { DatabaseConnection } from '../../src/uuid/infrastructure/database/database.connection';
import { Collection } from 'mongodb';
import { UuidV1Schema } from '../../src/uuid/infrastructure/database/schemas/uuid-v1.schema';
import { Rfc4122Uuid } from '../../src/uuid/domain/rfc4122-uuid';
import { UuidV1 } from '../../src/uuid/domain/time-based/uuid-v1';
import { Node } from '../../src/uuid/domain/time-based/node';
import { UuidFormats } from '../../src/uuid/domain/uuid-formats';

describe('uuid-v1', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let connection: DatabaseConnection;
  let uuids: Collection<UuidV1Schema>;

  beforeEach(async () => {
    app = await initiateApp([]);
    request = createRequest(app);

    connection = app.get<DatabaseConnection>(DatabaseConnection);
    uuids = connection.db.collection<UuidV1Schema>('uuids');
  });

  it('should generate a UUID V1', async () => {
    const response = await request.get('/uuid/v1/generate').expect(200);

    if (!isGenerateUuidResponse(response.body)) {
      fail('Invalid response was received');
    }

    const uuid = response.body.uuid;
    expect(Rfc4122Uuid.versionOf(uuid)).toBe(1);

    const count = await uuids.countDocuments({ version: 1 });
    expect(count).toBe(1);
  });

  it('should use the given time for generating the UUID', async () => {
    const time = '2021-10-12T00:00:00Z';
    const response = await request
      .get(`/uuid/v1/generate?time=${time}`)
      .expect(200);

    if (!isGenerateUuidResponse(response.body)) {
      fail('Invalid response was received');
    }

    const uuid = UuidV1.fromRfc4122(response.body.uuid);

    expect(uuid.time.date).toStrictEqual(new Date(time));
  });

  it('requires a valid time if given', async () => {
    await request.get('/uuid/v1/generate?time=foo').expect(400);
  });

  it('cannot have a time before 1582-10-15 at midnight UTC', async () => {
    const response = await request
      .get('/uuid/v1/generate?time=1582-10-14T23:59:59Z')
      .expect(400);

    if (!isErrorResponse(response.body)) {
      fail(NO_ERROR_RESPONSE_MESSAGE);
    }

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message).toHaveLength(1);
    expect(response.body.message[0]).toMatch(/time cannot be before/);
  });

  it('cannot have a time after 5236-03-31 at 21:21:00.683 UTC', async () => {
    const response = await request
      .get('/uuid/v1/generate?time=5236-03-31T21:21:00.684Z')
      .expect(400);

    if (!isErrorResponse(response.body)) {
      fail(NO_ERROR_RESPONSE_MESSAGE);
    }

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message).toHaveLength(1);
    expect(response.body.message[0]).toMatch(/time cannot be after/);
  });

  it('should use the given MAC address for generating the UUID', async () => {
    const node = 'DE:37:C3:74:65:A0';
    const response = await request
      .get(`/uuid/v1/generate?node=${node}`)
      .expect(200);

    if (!isGenerateUuidResponse(response.body)) {
      fail('Invalid response was received');
    }

    const uuid = UuidV1.fromRfc4122(response.body.uuid);

    expect(uuid.node).toStrictEqual(Node.fromString(node));
  });

  it('should not accept an invalid MAC address', async () => {
    const response = await request
      .get('/uuid/v1/generate?node=foo')
      .expect(400);

    if (!isErrorResponse(response.body)) {
      fail(NO_ERROR_RESPONSE_MESSAGE);
    }

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message[0]).toBe('node must be a MAC Address');
  });

  // noinspection SpellCheckingInspection
  it.each`
    format       | uuid
    ${'rfc4122'} | ${'aabc76c0-4579-11ec-9aba-c7c664f84093'}
    ${'base32'}  | ${'5AQHVC0HBS27P9NEP7RSJFGG4K'}
    ${'base58'}  | ${'N5pzcWmiMQCDzUWtc8LKVk'}
    ${'base64'}  | ${'qrx2wEV5EeyausfGZPhAkw=='}
    ${'binary'}  | ${'\xaa\xbcv\xc0Ey\x11\xec\x9a\xba\xc7\xc6d\xf8@\x93'}
    ${'number'}  | ${'226947319650481509970331210827634851987'}
  `(
    'should format the UUID as $format',
    async ({ format, uuid }: { format: UuidFormats; uuid: string }) => {
      const time = `2021-11-14T18:35:39.948Z`;
      const node = 'c7:c6:64:f8:40:93';

      // Prime the database with the expected node
      await uuids.insertOne({
        type: 'rfc4122',
        version: 1,
        date: new Date(new Date(time).getTime() - 1),
        nsOffset: 0,
        clockSequence: 0x1aba,
        node: Node.fromString(node).asNumber(),
      });

      await request
        .get(`/uuid/v1/generate?time=${time}&node=${node}&format=${format}`)
        .expect(200)
        .expect({ uuid });
    },
  );

  it('should throw an error if an invalid format is given', async () => {
    const response = await request
      .get('/uuid/v1/generate?format=foo')
      .expect(400);

    if (!isErrorResponse(response.body)) {
      fail(NO_ERROR_RESPONSE_MESSAGE);
    }

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message[0]).toBe('An invalid format was provided');
  });

  afterEach(async () => {
    const collection = await connection.db
      .listCollections({ name: 'uuids' })
      .next();

    if (collection !== null) {
      await connection.db.dropCollection('uuids');
    }

    await closeApp(app);
  });
});
