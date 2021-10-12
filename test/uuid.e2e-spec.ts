import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { UuidModule } from '../src/uuid/uuid.module';
import { INestApplication } from '@nestjs/common';
import { UuidV1 } from '../src/uuid/domain/uuid-v1';

describe('uuid', () => {
  const uuid = 'aa768af0-2adc-11ec-be43-cfd05c05f21f';
  let app: INestApplication;
  const uuidService = {
    generate: () => UuidV1.fromUuid(uuid),
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
  });

  it('should generate a UUID V1', () => {
    return request(app.getHttpServer())
      .get('/uuid/v1/generate')
      .expect(200)
      .expect({
        uuid,
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
