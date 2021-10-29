import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { UuidModule } from '../src/uuid/uuid.module';
import { INestApplication } from '@nestjs/common';
import { UuidTime } from '../src/uuid/domain/uuid-time';
import { ClockSequence } from '../src/uuid/domain/clock-sequence';
import { Node } from '../src/uuid/domain/node';
import { getFormatMethod, UuidMethod } from './get-format-method';
import { UuidFormats } from '../src/uuid/domain/uuid-formats';

interface ErrorResponse {
  statusCode: string;
  message: string[];
}

type UuidMock = {
  [P in UuidFormats as UuidMethod<P>]: jest.Mock<string>;
};

const uuid = 'aa768af0-2adc-11ec-be43-cfd05c05f21f';
// noinspection SpellCheckingInspection
const uuids: Record<UuidFormats, string> = {
  rfc4122: uuid,
  base32: '5AET5F0APW27PBWGYFT1E0BWGZ',
  base58: 'N3sY2tVyFNg6mc8mo2mMhG',
  base64: 'qnaK8CrcEey+Q8/QXAXyHw==',
  binary: '\xaa\x76\x8a\xf0\x2a\xdc\x11\xec\xbe\x43\xcf\xd0\x5c\x05\xf2\x1f',
  number: '226584268313291534147956877654481039903',
};

const mockUuidV1: UuidMock = {
  asRfc4122: jest.fn(() => uuids.rfc4122),
  asBase32: jest.fn(() => uuids.base32),
  asBase58: jest.fn(() => uuids.base58),
  asBase64: jest.fn(() => uuids.base64),
  asBinary: jest.fn(() => uuids.binary),
  asNumber: jest.fn(() => uuids.number),
};

const uuidService = {
  generate: jest.fn(() => mockUuidV1),
};

describe('uuid', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UuidModule],
    })
      .overrideProvider('UuidServiceInterface')
      .useValue(uuidService)
      .compile();

    app = module.createNestApplication();
    await app.init();

    request = supertest(app.getHttpServer());
  });

  it('should generate a UUID V1', async () => {
    await request.get('/uuid/v1/generate').expect(200).expect({ uuid });

    expect(uuidService.generate).toHaveBeenCalled();
    expect(uuidService.generate).toHaveBeenCalledWith(
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

    expect(uuidService.generate).toHaveBeenCalled();
    expect(uuidService.generate).toHaveBeenCalledWith(
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

    expect(uuidService.generate).toHaveBeenCalled();
    expect(uuidService.generate).toHaveBeenCalledWith(
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

    expect(uuidService.generate).toHaveBeenCalledWith(
      undefined,
      ClockSequence.fromNumber(0),
      undefined,
    );
  });

  it('should use the given MAC address for generating the UUID', async () => {
    const node = 'DE:37:C3:74:65:A0';
    await request.get(`/uuid/v1/generate?node=${node}`).expect(200);

    expect(uuidService.generate).toHaveBeenCalledWith(
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
    await app.close();
    jest.clearAllMocks();
  });
});
