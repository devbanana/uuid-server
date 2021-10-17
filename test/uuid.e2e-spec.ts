import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { UuidModule } from '../src/uuid/uuid.module';
import { INestApplication } from '@nestjs/common';
import { UuidV1 } from '../src/uuid/domain/uuid-v1';
import { UuidTime } from '../src/uuid/domain/uuid-time';

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
    expect(uuidService.generate).toHaveBeenCalledWith(undefined);
  });

  it('should use the given time for generating the UUID', async () => {
    await request
      .get('/uuid/v1/generate?time=2021-10-12T00:00:00Z')
      .expect(200)
      .expect({ uuid });

    expect(uuidService.generate).toHaveBeenCalled();
    expect(uuidService.generate).toHaveBeenCalledWith(
      UuidTime.fromString('2021-10-12T00:00:00Z'),
    );
  });

  it('requires a valid time if given', async () => {
    await request.get('/uuid/v1/generate?time=foo').expect(400);
  });

  it('cannot have a time before 1582-10-15 at midnight UTC', async () => {
    await request
      .get('/uuid/v1/generate?time=1582-10-14T23:59:59Z')
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['time cannot be before 1582-10-15T00:00:00Z'],
        error: 'Bad Request',
      });
  });

  it('cannot have a time after 5236-03-31 at 21:21:00.683 UTC', async () => {
    await request
      .get('/uuid/v1/generate?time=5236-03-31T21:21:00.684Z')
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['time cannot be after 5236-03-31T21:21:00.683Z'],
        error: 'Bad Request',
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
