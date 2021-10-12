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

  afterEach(async () => {
    await app.close();
  });
});
