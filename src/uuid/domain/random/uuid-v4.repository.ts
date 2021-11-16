import { UuidRepository } from '../uuid.repository';
import { UuidV4 } from './uuid-v4';

export abstract class UuidV4Repository implements UuidRepository {
  abstract save(uuid: UuidV4): Promise<void>;
}
