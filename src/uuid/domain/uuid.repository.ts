import { Uuid } from './uuid';

export interface UuidRepository {
  save(uuid: Uuid): Promise<void>;
}
