import { Binary, Document } from 'mongodb';

export interface UuidSchema extends Document {
  type: string;
  uuid: Binary;
}
