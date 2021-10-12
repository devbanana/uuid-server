import { Test, TestingModule } from '@nestjs/testing';
import { UuidService } from './uuid.service';
import { validate, version } from 'uuid';

describe('UuidService', () => {
  let provider: UuidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UuidService],
    }).compile();

    provider = module.get<UuidService>(UuidService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should generate a V1 UUID', () => {
    const uuid = provider.generate().asString();

    expect(validate(uuid)).toBeTruthy();
    expect(version(uuid)).toBe(1);
  });

  it('should use the given time', () => {
    const time = '2021-10-11 05:43:27';
    const uuid = provider.generate(time);

    expect(uuid.getTime()).toStrictEqual(new Date(time));
  });
});
