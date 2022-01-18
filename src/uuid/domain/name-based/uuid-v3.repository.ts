import { UuidRepository } from '../uuid.repository';
import { UuidV3 } from './uuid-v3';

export abstract class UuidV3Repository implements UuidRepository {
  abstract save(uuid: UuidV3): Promise<void>;
}
