import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConnection } from './database.connection';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { MongoNotConnectedError } from 'mongodb';

describe('DatabaseConnection', () => {
  let provider: DatabaseConnection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            DB_URI: Joi.string().required(),
          }),
        }),
      ],
      providers: [DatabaseConnection],
    }).compile();

    provider = module.get<DatabaseConnection>(DatabaseConnection);
    await provider.onModuleInit();
  });

  it('should be connected', async () => {
    const result = await provider.db.admin().ping();
    expect(result['ok']).toBe(1);
  });

  it('can close the connection', async () => {
    await provider.onModuleDestroy();

    expect.assertions(1);

    try {
      await provider.db.admin().ping();
    } catch (error) {
      expect(error).toBeInstanceOf(MongoNotConnectedError);
    }
  });

  afterAll(async () => {
    await provider.onModuleDestroy();
  });
});
