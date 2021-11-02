import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UuidTime } from '../src/uuid/domain/time-based/uuid-time';
import { ClockSequence } from '../src/uuid/domain/time-based/clock-sequence';
import { Node } from '../src/uuid/domain/time-based/node';
import { UuidFormats } from '../src/uuid/domain/uuid-formats';
import { ErrorResponse, UuidServiceMock } from './test.types';
import {
  closeApp,
  createMockUuid,
  createRequest,
  generateUuids,
  getFormatMethod,
  initiateApp,
} from './test.helpers';
import { UuidV1 } from '../src/uuid/domain/time-based/uuid-v1';

const uuid = 'aa768af0-2adc-11ec-be43-cfd05c05f21f';
const uuids = generateUuids(UuidV1.fromRfc4122(uuid));
const mockUuidV1 = createMockUuid(uuids);

const uuidService: UuidServiceMock = {
  generateV1: jest.fn(() => mockUuidV1),
};

describe('uuid-v1', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    app = await initiateApp(uuidService);
    request = createRequest(app);
  });

  it('should generate a UUID V1', async () => {
    await request.get('/uuid/v1/generate').expect(200).expect({ uuid });

    expect(uuidService.generateV1).toHaveBeenCalled();
    expect(uuidService.generateV1).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
    );
  });

  it('should use the given time for generating the UUID', async () => {
    await request
      .get('/uuid/v1/generate?time=2021-10-12T00:00:00Z')
      .expect(200)
      .expect({ uuid });

    expect(uuidService.generateV1).toHaveBeenCalled();
    expect(uuidService.generateV1).toHaveBeenCalledWith(
      UuidTime.fromString('2021-10-12T00:00:00Z'),
      undefined,
      undefined,
    );
  });

  it('requires a valid time if given', async () => {
    await request.get('/uuid/v1/generate?time=foo').expect(400);
  });

  it('cannot have a time before 1582-10-15 at midnight UTC', async () => {
    const response = await request
      .get('/uuid/v1/generate?time=1582-10-14T23:59:59Z')
      .expect(400);

    expect(response.body).toHaveProperty('message');

    const responseBody = response.body as ErrorResponse;
    expect(responseBody.statusCode).toBe(400);
    expect(responseBody.message).toHaveLength(1);
    expect(responseBody.message[0]).toMatch(/time cannot be before/);
  });

  it('cannot have a time after 5236-03-31 at 21:21:00.683 UTC', async () => {
    const response = await request
      .get('/uuid/v1/generate?time=5236-03-31T21:21:00.684Z')
      .expect(400);

    expect(response.body).toHaveProperty('message');

    const responseBody = response.body as ErrorResponse;
    expect(responseBody.statusCode).toBe(400);
    expect(responseBody.message).toHaveLength(1);
    expect(responseBody.message[0]).toMatch(/time cannot be after/);
  });

  it('should use the given clock sequence for generating the UUID', async () => {
    await request.get('/uuid/v1/generate?clockSeq=2024').expect(200);

    expect(uuidService.generateV1).toHaveBeenCalled();
    expect(uuidService.generateV1).toHaveBeenCalledWith(
      undefined,
      ClockSequence.fromNumber(2024),
      undefined,
    );
  });

  it('requires a valid clock sequence', async () => {
    const response = await request
      .get('/uuid/v1/generate?clockSeq=foo')
      .expect(400);

    expect(response.body).toHaveProperty('message');

    const responseBody = response.body as ErrorResponse;
    expect(responseBody.statusCode).toBe(400);
    expect(responseBody.message[0]).toMatch(
      /clockSeq must be an integer number/,
    );
  });

  it('cannot have a clock sequence less than 0', async () => {
    const response = await request
      .get('/uuid/v1/generate?clockSeq=-10')
      .expect(400);

    expect(response.body).toHaveProperty('message');

    const responseBody = response.body as ErrorResponse;
    expect(responseBody.statusCode).toBe(400);
    expect(responseBody.message[0]).toMatch(/clockSeq must not be less than 0/);
  });

  it('cannot have a clock sequence greater than 0x3FFF', async () => {
    const response = await request
      .get('/uuid/v1/generate?clockSeq=16384')
      .expect(400);

    expect(response.body).toHaveProperty('message');

    const responseBody = response.body as ErrorResponse;
    expect(responseBody.statusCode).toBe(400);
    expect(responseBody.message[0]).toMatch(
      /clockSeq must not be greater than 16383/,
    );
  });

  it('should allow clock sequence to be 0', async () => {
    await request.get('/uuid/v1/generate?clockSeq=0').expect(200);

    expect(uuidService.generateV1).toHaveBeenCalledWith(
      undefined,
      ClockSequence.fromNumber(0),
      undefined,
    );
  });

  it('should use the given MAC address for generating the UUID', async () => {
    const node = 'DE:37:C3:74:65:A0';
    await request.get(`/uuid/v1/generate?node=${node}`).expect(200);

    expect(uuidService.generateV1).toHaveBeenCalledWith(
      undefined,
      undefined,
      Node.fromString(node),
    );
  });

  it('should not accept an invalid MAC address', async () => {
    const response = await request
      .get('/uuid/v1/generate?node=foo')
      .expect(400);

    expect(response.body).toHaveProperty('message');

    const responseBody = response.body as ErrorResponse;
    expect(responseBody.statusCode).toBe(400);
    expect(responseBody.message[0]).toBe('node must be a MAC Address');
  });

  it.each`
    format
    ${'rfc4122'}
    ${'base32'}
    ${'base58'}
    ${'base64'}
    ${'binary'}
    ${'number'}
  `(
    'should format the UUID as $format',
    async ({ format }: { format: UuidFormats }) => {
      await request
        .get(`/uuid/v1/generate?format=${format}`)
        .expect(200)
        .expect({
          uuid: uuids[format],
        });

      // Only the format function should be called, but not the others
      Object.entries(mockUuidV1).forEach(([key, mock]) =>
        expect(mock).toBeCalledTimes(key === getFormatMethod(format) ? 1 : 0),
      );
    },
  );

  it('should throw an error if an invalid format is given', async () => {
    const response = await request
      .get('/uuid/v1/generate?format=foo')
      .expect(400);

    expect(response.body).toHaveProperty('message');

    const responseBody = response.body as ErrorResponse;
    expect(responseBody.statusCode).toBe(400);
    expect(responseBody.message[0]).toBe('An invalid format was provided');
  });

  afterEach(async () => {
    await closeApp(app);
  });
});