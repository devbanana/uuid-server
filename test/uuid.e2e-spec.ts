import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { UuidModule } from '../src/uuid/uuid.module';
import { INestApplication } from '@nestjs/common';
import { UuidTime } from '../src/uuid/domain/uuid-time';
import { ClockSequence } from '../src/uuid/domain/clock-sequence';
import { Node } from '../src/uuid/domain/node';

interface ErrorResponse {
  statusCode: string;
  message: string[];
}

interface UuidMock {
  asRfc4122: jest.Mock<string>;
  asBase32: jest.Mock<string>;
  asBase58: jest.Mock<string>;
  asBase64: jest.Mock<string>;
  asBinary: jest.Mock<string>;
  asNumber: jest.Mock<string>;
}

const uuid = 'aa768af0-2adc-11ec-be43-cfd05c05f21f';
// noinspection SpellCheckingInspection
const base32Uuid = '5AET5F0APW27PBWGYFT1E0BWGZ';
const base58Uuid = 'N3sY2tVyFNg6mc8mo2mMhG';
const base64Uuid = 'qnaK8CrcEey+Q8/QXAXyHw==';
const binaryUuid =
  '\xaa\x76\x8a\xf0\x2a\xdc\x11\xec\xbe\x43\xcf\xd0\x5c\x05\xf2\x1f';
const numberUuid = '226584268313291534147956877654481039903';

describe('uuid', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let mockUuidV1: UuidMock;
  let uuidService: { generate: jest.Mock };

  beforeAll(() => {
    mockUuidV1 = {
      asRfc4122: jest.fn(() => uuid),
      asBase32: jest.fn(() => base32Uuid),
      asBase58: jest.fn(() => base58Uuid),
      asBase64: jest.fn(() => base64Uuid),
      asBinary: jest.fn(() => binaryUuid),
      asNumber: jest.fn(() => numberUuid),
    };

    uuidService = {
      generate: jest.fn(() => mockUuidV1),
    };
  });

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

  it('should format the UUID as RFC 4122', async () => {
    await request.get('/uuid/v1/generate?format=rfc4122').expect(200);

    expect(mockUuidV1.asRfc4122).toHaveBeenCalledTimes(1);
    expect(mockUuidV1.asBase32).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase58).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase64).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBinary).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asNumber).toHaveBeenCalledTimes(0);
  });

  it('should format the UUID as base 32', async () => {
    await request.get('/uuid/v1/generate?format=base32').expect(200).expect({
      uuid: base32Uuid,
    });

    expect(mockUuidV1.asRfc4122).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase32).toHaveBeenCalledTimes(1);
    expect(mockUuidV1.asBase58).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase64).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBinary).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asNumber).toHaveBeenCalledTimes(0);
  });

  it('should format the UUID as base 58', async () => {
    await request.get('/uuid/v1/generate?format=base58').expect(200).expect({
      uuid: base58Uuid,
    });

    expect(mockUuidV1.asRfc4122).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase32).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase58).toHaveBeenCalledTimes(1);
    expect(mockUuidV1.asBase64).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBinary).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asNumber).toHaveBeenCalledTimes(0);
  });

  it('should format the UUID as base 64', async () => {
    await request.get('/uuid/v1/generate?format=base64').expect(200).expect({
      uuid: base64Uuid,
    });

    expect(mockUuidV1.asRfc4122).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase32).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase58).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase64).toHaveBeenCalledTimes(1);
    expect(mockUuidV1.asBinary).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asNumber).toHaveBeenCalledTimes(0);
  });

  it('should format the UUID as binary', async () => {
    await request.get('/uuid/v1/generate?format=binary').expect(200).expect({
      uuid: binaryUuid,
    });

    expect(mockUuidV1.asRfc4122).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase32).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase58).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase64).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBinary).toHaveBeenCalledTimes(1);
    expect(mockUuidV1.asNumber).toHaveBeenCalledTimes(0);
  });

  it('should format the UUID as a number', async () => {
    await request.get('/uuid/v1/generate?format=number').expect(200).expect({
      uuid: numberUuid,
    });

    expect(mockUuidV1.asRfc4122).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase32).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase58).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBase64).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asBinary).toHaveBeenCalledTimes(0);
    expect(mockUuidV1.asNumber).toHaveBeenCalledTimes(1);
  });

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
