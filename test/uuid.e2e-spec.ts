import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { UuidModule } from '../src/uuid/uuid.module';
import { INestApplication } from '@nestjs/common';
import { UuidV1 } from '../src/uuid/domain/uuid-v1';
import { UuidTime } from '../src/uuid/domain/uuid-time';
import { ClockSequence } from '../src/uuid/domain/clock-sequence';
import { Node } from '../src/uuid/domain/node';

interface ErrorResponse {
  statusCode: string;
  message: string[];
}

describe('uuid', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  const uuid = 'aa768af0-2adc-11ec-be43-cfd05c05f21f';
  const uuidService = {
    generate: jest.fn(() => UuidV1.fromUuid(uuid)),
  };

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

  afterEach(async () => {
    await app.close();
    uuidService.generate.mockClear();
  });
});
