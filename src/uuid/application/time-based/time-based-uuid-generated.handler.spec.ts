import { Test, TestingModule } from '@nestjs/testing';
import { TimeBasedUuidGeneratedHandler } from './time-based-uuid-generated.handler';
import { FakeUuidV1Repository } from '../../../../test/utils/test.fakes';
import { UuidV1Repository } from '../../domain/time-based/uuid-v1.repository';
import { UuidV1 } from '../../domain/time-based/uuid-v1';
import { TimeBasedUuidGeneratedEvent } from './time-based-uuid-generated.event';

describe('TimeBasedUuidGeneratedHandler', () => {
  let provider: TimeBasedUuidGeneratedHandler;
  let repository: FakeUuidV1Repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeBasedUuidGeneratedHandler,
        { provide: UuidV1Repository, useClass: FakeUuidV1Repository },
      ],
    }).compile();

    provider = module.get<TimeBasedUuidGeneratedHandler>(
      TimeBasedUuidGeneratedHandler,
    );
    repository = module.get<UuidV1Repository, FakeUuidV1Repository>(
      UuidV1Repository,
    );
  });

  it('should save the UUID', async () => {
    const spy = jest.spyOn(repository, 'save');

    const uuid = UuidV1.fromRfc4122('4308f226-451d-11ec-bcd0-3f40581898fb');
    await provider.handle(new TimeBasedUuidGeneratedEvent(uuid));

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(uuid);
  });
});
