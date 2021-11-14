import { Test, TestingModule } from '@nestjs/testing';
import { SystemClock } from './system-clock';

describe('SystemClock', () => {
  let provider: SystemClock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemClock],
    }).compile();

    provider = module.get<SystemClock>(SystemClock);
  });

  it('should get the current time', () => {
    const currentTime = Date.now();
    expect(Math.abs(provider.now() - currentTime)).toBeLessThan(2);
  });
});
